`soundcloud-search`
===================

CLI to query Soundcloud for tracks matching a given query

Installation
------------

```bash
npm install soundcloud-search
```

Add `-g` to install globally, otherwise execute using `node_modules/.bin/soundcloud-search`

Usage
-----

```
NAME
  soundcloud-search - CLI to query Soundcloud for tracks matching a given query

SYNOPSIS
  soundcloud-search [OPTION]... FILE

DESCRIPTION
  Resolve track queries to Soundcloud tracks, taking queries as each line of FILE.
  Unfortunately an explicit input file and output file has to be given since
  STDIN and STDOUT are used to prompt the user to resolve tracks for each query.

  -o, --output-file
    required. Where to write resulting JSON objects. Output as NDJSON

  -n, --num-results
    max number of results to display when prompting the user to resolve queries

  -s, --soundcloud-client-id
    soundcloud client ID to use when accessing their API. Can also be set with
    the env var SC_CLIENT_ID

EXAMPLE

  Read all track plays from a CSV file with headers `artist` and `track`

    export SC_CLIENT_ID="..."
    soundcloud-search -o results/tracks.ndjson \
      <(cat data/plays.csv | \
        csv-parser --separator=";" | \
        jq -r '.artist + " - " + .track' \
      )
```

License
-------

[ISC](LICENSE)
