#################################################################################
# If you're reading this, you probably meant to right click > Run with PowerShell
#################################################################################

$hostLocation = "http://localhost:5050/"

$http = [System.Net.HttpListener]::New()
$http.Prefixes.Add($hostLocation)
# $http.AuthenticationSchemes = [System.Net.AuthenticationSchemes]::IntegratedWindowsAuthentication
$http.Start()

New-PSDrive -Name FileServe -PSProvider FileSystem -Root "C:\Users\petsc\Pictures"
# [System.Diagnostics.Process]::Start("msedge", $hostLocation) # Or "chrome"
Start-Process $hostLocation

if ($http.IsListening) {
	Write-Host "Flight Director started on http://localhost:5050"
	Write-Host "Stop Flight Director by closing this window"
}

try {
	while ($http.IsListening) {
		$contextTask = $http.GetContextAsync()
		# Waits in increments allowing pipeline stops to be processed (i.e. CTRL+C)
		while (-not $contextTask.AsyncWaitHandle.WaitOne(50)) { }
		$context = $contextTask.GetAwaiter().GetResult()
		$req = $context.Request
		$res = $context.Response

		# Write-Host ($context.Request | Format-List | Out-String)
		$path = $context.Request.Url.LocalPath
		$content = ""

		try {
			# Serve app
			if ($path -eq "/") {
				$item = Get-Item -LiteralPath "FileServe:\Flight Director.html" -Force -ErrorAction Stop
				$res.ContentType = "text/html"
				$content = [System.IO.File]::ReadAllBytes($item)
			}
			# Serve default config file
			elseif ($path.StartsWith("/config")) {
				$item = Get-Item -LiteralPath "FileServe:\flightdirector.toml" -Force -ErrorAction Stop
				$res.ContentType = "text/plain"
				$content = [System.IO.File]::ReadAllBytes($item)
			}
			# List directory or file details
			elseif ($path.StartsWith("/api")) {
				$path = $path.Replace("/api", "");
				$item = Get-Item -LiteralPath "FileServe:\$path" -Force -ErrorAction Stop
				if ($item.Attributes -match "Directory") {
					# Directory
					$subitems = Get-ChildItem -LiteralPath "FileServe:\$path"
					$subitemsReturn = foreach ($subitem in $subitems) {
						$info = @{
							name = $subitem.Name
						}
						if ($subitem.DirectoryName) {
							$info["kind"] = "file"
							$info["size"] = $subitem.Length
							$info["lastModified"] = $subitem.LastWriteTime | Get-Date -Format "s"
						}
						else {
							$info["kind"] = "directory"
						}
						$info
					}
					if ($subitemsReturn -eq $null) {
						$content = "[]"
					}
					else {
						$content = $subitemsReturn | ConvertTo-Json
					}
					if ($subitemsReturn.Length -eq 1) {
						$content = "[$content]"
					}
				}
				else {
					# File
					$info = @{
						kind = "file"
						name = $item.Name
						size = $item.Length
						lastModified = $item.LastWriteTime | Get-Date -Format "s"
					}
					$content = $info | ConvertTo-Json
				}
				$res.ContentType = "application/json"
				$content = [System.Text.Encoding]::UTF8.GetBytes($content)
			}
			# Open natively
			elseif ($path.StartsWith("/open")) {
				$path = $path.Replace("/open", "");
				$item = Get-Item -LiteralPath "FileServe:\$path" -Force -ErrorAction Stop
				# Invoke-Item $item # Opens behind for some reason
				explorer $item
			}
			# Serve file (i.e. download)
			elseif ($path.StartsWith("/download")) {
				$path = $path.Replace("/download", "");
				$item = Get-Item -LiteralPath "FileServe:\$path" -Force -ErrorAction Stop
				try {
					$res.ContentType = [System.Web.MimeMapping]::GetMimeMapping($item.FullName)
				}
				catch {
					$res.ContentType = "application/octet-stream"
				}
				$content = [System.IO.File]::ReadAllBytes($item.FullName)
			}
			elseif ($path.StartsWith("/save")) {
				$path = $path.Replace("/save", "");
				$streamReader = [System.IO.StreamReader]::new($req.InputStream)
				$body = $streamReader.ReadToEnd()
				New-Item -Path "FileServe:\$path" -ItemType File -Force -Value $body
			}
			else {
				$content = [System.Text.Encoding]::UTF8.GetBytes("Invalid URL");
			}
		}
		catch [System.Management.Automation.ItemNotFoundException] {
			Write-Host "Couldn't find requested path: $path"
			$res.StatusCode = 404
			# $content = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 - Page not found</h1>")
		}

		$res.ContentLength64 = $content.Length
		$res.OutputStream.Write($content, 0, $content.Length)
		$res.Close()
	}
}
finally {
	$http.Stop()
}
[Console]::ReadKey()
