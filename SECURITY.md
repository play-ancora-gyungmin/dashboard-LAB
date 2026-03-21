# Security Policy

## Supported Scope

`dashboard-LAB` is a local-first desktop and web workspace. Security reports are especially useful for:

- local file access boundaries
- command execution paths
- Electron preload and IPC exposure
- bundled desktop artifacts
- credential and API key handling

## Reporting

Please do not open public issues for sensitive vulnerabilities.

Until a dedicated security inbox is added, report privately to the project maintainer through a direct channel and include:

- affected version or commit
- reproduction steps
- impact assessment
- suggested mitigations if available

## Hardening Notes

- The Electron shell keeps `nodeIntegration` off and uses `preload`.
- Desktop packaging currently disables the embedded terminal server to avoid native module rebuild issues in the baseline release.
- Local state and generated documents should stay outside version control.
