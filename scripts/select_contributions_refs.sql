-- Script pour Rémi: liste des contenus liés pour chaque contribution 

select da."source" || '/' || da.slug as page_slug, da.cdtn_id as page_cdtn_id, dr."source" || '/' || dr.slug as ref_slug, dr.cdtn_id as ref_cdtn_id
from contribution.answer_cdtn_references acr
inner join public.documents dr on dr.cdtn_id = acr.cdtn_id
inner join contribution.answers a on a.id = acr.answer_id 
inner join contribution.questions q on q.id = a.question_id 
inner join public.documents da on da."source" = 'contributions' and da.title = q."content"
    and a.agreement_id = coalesce(da."document"->'answers'->'conventionAnswer'->>'idcc', '0000')
