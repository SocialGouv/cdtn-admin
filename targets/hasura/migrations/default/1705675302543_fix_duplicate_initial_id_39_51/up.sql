update documents
set initial_id = a.id
  from contribution.answers a
inner join contribution.questions q on q.id = a.question_id
where documents."source" = 'contributions'
  and a.agreement_id = split_part(documents."text", ' ', 1)
  and q."content" = documents."title"
  and q.order in (39, 51);
