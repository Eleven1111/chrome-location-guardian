$ErrorActionPreference = "Stop"

$TaskName = "Chrome Location Guardian"

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host "Uninstalled scheduled task: $TaskName"
} else {
  Write-Host "Scheduled task not found: $TaskName"
}
