# INRFS Financer Web

React/Vite web application for the INRFS Financer and Admin portals. The application requires the sibling `inrfs_financer_api` ASP.NET Core project.

## Local development

Prerequisites: Node.js, npm and the .NET 9 SDK.

```powershell
cd INRFS_FINANCER_FE
npm install
dotnet restore ../inrfs_financer_api/INRFS.Financer.slnx --ignore-failed-sources -p:NuGetAudit=false
dotnet build ../inrfs_financer_api/INRFS.Financer.slnx --no-restore -p:NuGetAudit=false
npm run dev
```

`npm run dev` starts both services:

- Web: `http://localhost:5173`
- API and Swagger: `http://localhost:5187` and `http://localhost:5187/swagger`

Stop both with `Ctrl+C`. To run them separately, use `npm run dev:web` and `npm run dev:api` in separate terminals. The Vite proxy defaults to `http://localhost:5187`; override it with `VITE_DEV_API_TARGET` when necessary.

The development launcher deliberately uses `inrfs_financer_api/src/INRFS.Financer.API/App_Data/inrfs-financer.db`, preventing machine-level production connection variables from leaking into local runs. Set `INRFS_DEV_CONNECTION_STRING` only when you intentionally need a different development database.

The API uses its local SQLite database in Development. A user that does not exist yet can be created through **Create account**. Configure a seeded administrator and development secrets as described in `../inrfs_financer_api/README.md`.

## Verification

```powershell
npm run lint
npm test
npm run build
npm run test:e2e
```
