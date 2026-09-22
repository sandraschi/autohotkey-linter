# Per-repo fleet start config for autohotkey-linter
# Edit ports/backend target here - start.ps1 is fleet-standard.
@{
    Name         = 'autohotkey-linter'
    BackendPort  = 11076
    FrontendPort = 11077
    HealthPath   = '/api/health'
    WebRoot      = 'web_sota\frontend'
    Backend = @{
        Kind          = 'uvicorn'
        UvicornTarget = 'server:app'
        Env           = @{ WEB_PORT = '11076' }
    }
    Frontend = @{
        Kind           = 'vite-npm'
        PackageManager = 'npm'
        PortEnvVar     = 'VITE_PORT'
        ApiTargetEnv   = 'VITE_API_TARGET'
    }
}
