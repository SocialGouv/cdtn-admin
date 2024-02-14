update documents
set initial_id = a.id
  from contribution.answers a
inner join contribution.questions q on q.id = a.question_id
where documents."source" = 'contributions'
  and (
  (pg_input_is_valid(split_part(documents."text", ' ', 1), 'int') and
      a.agreement_id = split_part(documents."text", ' ', 1))
      or (not pg_input_is_valid(split_part(documents."text", ' ', 1), 'int') and a.agreement_id = '0000')
  )
  and q."content" = documents."title"
  and q.order in (1, 3, 8, 13, 17, 34, 43, 44, 45, 46, 52, 53);