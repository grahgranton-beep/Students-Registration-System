# Student Registration System - Database Backup Script

$BackupDir = Join-Path $PSScriptRoot "..\backups"
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$MySQLDumpPath = "C:\xampp2\mysql\bin\mysqldump.exe"
$SQLiteDBPath = Join-Path $PSScriptRoot "..\backend\students_registration.db"

Write-Host "============================================="
Write-Host "Academic Registration System Database Backup"
Write-Host "============================================="

if (Test-Path $MySQLDumpPath) {
    # Perform MySQL backup
    Write-Host "MySQL installation detected at $MySQLDumpPath"
    
    $BackupFile = Join-Path $BackupDir "students_registration_mysql_backup_$Timestamp.sql"
    
    # Run mysqldump
    Write-Host "Running mysqldump..."
    & $MySQLDumpPath --user=root --databases students_registration --result-file="$BackupFile"
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $BackupFile)) {
        Write-Host "SUCCESS: MySQL database backup saved to: $BackupFile" -ForegroundColor Green
    } else {
        Write-Host "ERROR: MySQL backup failed with exit code $LASTEXITCODE. Double check if MySQL service is running on 3306." -ForegroundColor Red
    }
} else {
    Write-Host "XAMPP MySQL dump not found at: $MySQLDumpPath" -ForegroundColor Yellow
    Write-Host "Checking SQLite fallback database..."
    
    if (Test-Path $SQLiteDBPath) {
        $BackupFile = Join-Path $BackupDir "students_registration_sqlite_backup_$Timestamp.db"
        Copy-Item -Path $SQLiteDBPath -Destination $BackupFile -Force
        
        if (Test-Path $BackupFile) {
            Write-Host "SUCCESS: SQLite fallback database backed up to: $BackupFile" -ForegroundColor Green
        } else {
            Write-Host "ERROR: SQLite database backup copying failed." -ForegroundColor Red
        }
    } else {
        Write-Host "ERROR: No active MySQL database on XAMPP and no SQLite fallback DB found to back up." -ForegroundColor Red
    }
}
Write-Host "============================================="
