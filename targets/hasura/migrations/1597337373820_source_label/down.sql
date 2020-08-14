UPDATE
  public.sources
SET
  label = 'code du travail'
WHERE
  repository = 'socialgouv/legi-data';

UPDATE
  public.sources
SET
  label = 'convention collective'
WHERE
  repository = 'socialgouv/kali-data';


UPDATE
  public.sources
SET
  label = 'fiches service-public'
WHERE
  repository = 'socialgouv/fiches-vdd';
