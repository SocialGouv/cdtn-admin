UPDATE
  public.sources
SET
  label = 'Code du travail'
WHERE
  repository = 'socialgouv/legi-data';

UPDATE
  public.sources
SET
  label = 'Convention collective'
WHERE
  repository = 'socialgouv/kali-data';


UPDATE
  public.sources
SET
  label = 'Fiches service-public'
WHERE
  repository = 'socialgouv/fiches-vdd';
