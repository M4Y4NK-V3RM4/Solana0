# Raw research data

Put the JSON Lines files from the data-collection assistants here (any sub-folders), then run:

```bash
npm run import-data          # verified records only
npm run import-data -- --all # include unverified (shown with a warning)
```

See `docs/data-collection-prompt.md` for the format and `data/import-report.md` for the last import.
