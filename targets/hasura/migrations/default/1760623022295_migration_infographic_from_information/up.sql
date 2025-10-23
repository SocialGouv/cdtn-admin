WITH inserted AS (
  INSERT INTO infographic.infographic (display_date, title, meta_title, transcription, pdf, svg, description, meta_description)
    SELECT
      i.display_date,
      CASE
        WHEN ic.title LIKE 'La procédure%' THEN i.title
        ELSE ic.title
        END AS title,
      CASE
        WHEN ic.title LIKE 'La procédure%' THEN i.title
        ELSE ic.title
        END AS meta_title,
      icb.content AS transcription,
      icb.file_id AS pdf,
      icb.img_id AS svg,
      '',
      ''
    FROM information.informations_contents_blocks icb
           JOIN information.informations_contents ic
                ON icb.informations_contents_id = ic.id
           JOIN information.informations i
                ON ic.informations_id = i.id
    WHERE icb.type = 'graphic'
    RETURNING id, svg
)
UPDATE information.informations_contents_blocks icb
SET infographic_id = inserted.id, content = ''
FROM inserted
WHERE icb.img_id = inserted.svg;
