delete from contribution.questions
where "order" = any(
        array [2, 49, 3, 32, 21, 22, 24, 25, 27, 28, 30, 31]
    );
