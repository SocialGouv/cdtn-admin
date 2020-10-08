# Ingester aka Miam-miam

This program will populate the drocuments table with documents from various datasources (mostly @socialgouv/data-\* packages).

- each article from LEGITEXT000006072050 will be a document
- each CCn from @socialgouv/kali-data will be a document with generic data and dedicated contributions answer
- each Question from @socialgouv/contributions-data will be a document
- a filtered dataset from fiche-vdd
- a filtered dataset from travail-emploi

## Usage

```sh
# Populate database provided using env var
$ yarn workspace ingester start
```
