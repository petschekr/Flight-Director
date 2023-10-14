#################################################################################
# If you're reading this, you probably meant to right click > Run with PowerShell
#################################################################################

$hostLocation = "http://localhost:5050/"

Add-Type -AssemblyName System.Security
Add-Type -AssemblyName System.Web
Add-Type -AssemblyName Microsoft.VisualBasic

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
			# Serve default config file
			if ($path.StartsWith("/api/config")) {
				$item = Get-Item -LiteralPath "FileServe:\flightdirector.toml" -Force -ErrorAction Stop
				$res.ContentType = "text/plain"
				$content = [System.IO.File]::ReadAllBytes($item)
			}
			# Serve default performance file
			elseif ($path.StartsWith("/api/performance")) {
				$item = Get-Item -LiteralPath "FileServe:\performance.toml" -Force -ErrorAction Stop
				$res.ContentType = "text/plain"
				$content = [System.IO.File]::ReadAllBytes($item)
			}
			# List directory or file details
			elseif ($path.StartsWith("/api/list")) {
				$path = $path.Replace("/api/list", "");
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
			elseif ($path.StartsWith("/api/open")) {
				$path = $path.Replace("/api/open", "");
				$item = Get-Item -LiteralPath "FileServe:\$path" -Force -ErrorAction Stop
				# Invoke-Item $item # Opens behind for some reason
				explorer $item
			}
			# Serve file (i.e. download)
			elseif ($path.StartsWith("/api/download")) {
				$path = $path.Replace("/api/download", "");
				$item = Get-Item -LiteralPath "FileServe:\$path" -Force -ErrorAction Stop
				try {
					$res.ContentType = [System.Web.MimeMapping]::GetMimeMapping($item.FullName)
				}
				catch {
					$res.ContentType = "application/octet-stream"
				}
				$content = [System.IO.File]::ReadAllBytes($item.FullName)
			}
			elseif ($path.StartsWith("/api/save")) {
				$path = $path.Replace("/api/save", "");
				$streamReader = [System.IO.StreamReader]::new($req.InputStream)
				$body = $streamReader.ReadToEnd()
				New-Item -Path "FileServe:\$path" -ItemType File -Force -Value $body
			}
			elseif ($path.StartsWith("/api/sharepoint/login")) {
				# Bring the certificate prompt to foreground
				# [Microsoft.VisualBasic.Interaction]::AppActivate($PID)

				# Go through login process
				$ValidCerts = [System.Security.Cryptography.X509Certificates.X509Certificate2[]](dir Cert:\CurrentUser\My | where { $_.NotAfter -gt (Get-Date) })
				$Cert = [System.Security.Cryptography.X509Certificates.X509Certificate2UI]::SelectFromCollection(
					$ValidCerts,
					'Choose a certificate',
					'Choose a certificate',
					'SingleSelection'
				) | Select-Object -First 1

				if ($Cert) {
					Write-Host "Logging in..."
					$InitialParams = @{
						Uri             = "https://intelshare.intelink.gov/"
						SessionVariable = "Session"
						Method          = "GET"
						Certificate     = $Cert
					}
					$Response = Invoke-WebRequest @InitialParams -UseBasicParsing

					Write-Host "Accepting policy..."
					$LoginParams = @{
						Uri         = "https://intelshare.intelink.gov/my.policy"
						Method      = "POST"
						Body        = @{
							choice = "0"
						}
						WebSession  = $Session
						Certificate = $Cert
					}
					$Response = Invoke-WebRequest @LoginParams -UseBasicParsing

					Write-Host "Submitting trust authentication..."
					$WResult = $Response.RawContent | Select-String -Pattern 'name="wresult" value="(.*?)"'
					$WResult = $WResult.Matches[0].Groups[1]
					$WResult = $WResult.Value.Replace("&lt;", "<").Replace("&quot;", '"')

					$TrustParams = @{
						Uri         = "https://intelshare.intelink.gov/_trust"
						Method      = "POST"
						Body        = @{
							wa      = "wsignin1.0"
							wresult = $WResult
							wctx    = "https://intelshare.intelink.gov/_layouts/15/Authenticate.aspx?Source=%2F"
						}
						WebSession  = $Session
						Certificate = $Cert
					}
					$Response = Invoke-WebRequest @TrustParams -UseBasicParsing
					Write-Host "Done!"
					$res.StatusCode = 204;
				}
				else {
					$res.StatusCode = 401;
				}
			}
			elseif ($path.StartsWith("/api/sharepoint/download")) {
				$site = $path.Replace("/api/sharepoint/download/", "");
				$downloadLocation = [System.Web.HttpUtility]::ParseQueryString($req.Url.Query).Get("location");
				New-Item -Path "FileServe:\$downloadLocation" -ItemType File -Force

				$ProxyParams = @{
					Uri         = "https://" + $site
					OutFile     = "FileServe:\$downloadLocation"
					WebSession  = $Session
					Certificate = $Cert
				}
				try {
					Invoke-WebRequest @ProxyParams -UseBasicParsing
				}
				catch {
					Write-Host ($_.Exception.Response | Format-List | Out-String)
					$res.StatusCode = 502
				}
			}
			elseif ($path.StartsWith("/api/sharepoint")) {
				$site = $req.Url.PathAndQuery.Replace("/api/sharepoint/", "");

				$streamReader = [System.IO.StreamReader]::new($req.InputStream)
				$body = $streamReader.ReadToEnd()

				$ProxyParams = @{
					Uri         = "https://" + $site
					Method      = $req.HttpMethod
					Headers     = @{
						Accept = "application/json;odata=verbose"
					}
					# ContentType = "text/xml; charset=UTF-8"
					WebSession  = $Session
					Certificate = $Cert
				}
				if ($req.HttpMethod -eq "POST") {
					$ProxyParams.Body = $body
				}
				try {
					$Response = Invoke-WebRequest @ProxyParams -UseBasicParsing
					$content = [System.Text.Encoding]::UTF8.GetBytes($Response.Content);
					$res.ContentType = "application/json"
				}
				catch {
					Write-Host ($_.Exception.Response | Format-List | Out-String)
					$res.StatusCode = 502
				}
			}
			elseif ($path.StartsWith("/api/weather")) {
				$station = [System.Web.HttpUtility]::ParseQueryString($req.Url.Query).Get("station");

				$ValidCerts = [System.Security.Cryptography.X509Certificates.X509Certificate2[]](dir Cert:\CurrentUser\My | where { $_.NotAfter -gt (Get-Date) })

				if ($null -eq $Cert) {
					$Cert = [System.Security.Cryptography.X509Certificates.X509Certificate2UI]::SelectFromCollection(
						$ValidCerts,
						'Choose a certificate',
						'Choose a certificate',
						'SingleSelection'
					) | Select-Object -First 1
				}

				if ($Cert) {
					$ProxyParams = @{
						Uri         = "https://gisweather.afwa.af.mil/services/MISC?SERVICE=MISC&REQUEST=script%2Fstation_data&TYPE=metars%2Csynoptic%2Ctafs%2Csummary&HOURS=24&LOC=$station"
						Method      = "GET"
						Headers     = @{
							# Accept = "application/json;odata=verbose"
						}
						Certificate = $Cert
					}
					try {
						$Response = Invoke-WebRequest @ProxyParams -UseBasicParsing
						$content = [System.Text.Encoding]::UTF8.GetBytes($Response.Content);
						$res.ContentType = "application/json"
					}
					catch {
						Write-Host ($_.Exception.Response | Format-List | Out-String)
						$res.StatusCode = 502
					}
				}
				else {
					$res.StatusCode = 401;
				}
			}
			else {
				# Serve app at root URL
				# The Vue router handles user-facing, non-API URLs
				$item = Get-Item -LiteralPath "FileServe:\Flight Director.html" -Force -ErrorAction Stop
				$res.ContentType = "text/html"
				$content = [System.IO.File]::ReadAllBytes($item)
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
