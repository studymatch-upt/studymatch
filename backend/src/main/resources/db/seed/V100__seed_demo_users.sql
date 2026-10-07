-- Demo users for local development. Not loaded when db/seed is removed
-- from spring.flyway.locations.
INSERT INTO app_user (name, email, role) VALUES
    ('Ana Teacher',      'ana.teacher@school.test',  'TEACHER'),
    ('Bruno Teacher',    'bruno.teacher@school.test','TEACHER'),
    ('Carla Mendes',     'carla@school.test',        'STUDENT'),
    ('Diogo Ferreira',   'diogo@school.test',        'STUDENT'),
    ('Eva Costa',        'eva@school.test',          'STUDENT'),
    ('Filipe Santos',    'filipe@school.test',       'STUDENT'),
    ('Gabriela Rocha',   'gabriela@school.test',     'STUDENT'),
    ('Hugo Almeida',     'hugo@school.test',         'STUDENT'),
    ('Inês Carvalho',    'ines@school.test',         'STUDENT'),
    ('João Pereira',     'joao@school.test',         'STUDENT'),
    ('Leonor Sousa',     'leonor@school.test',       'STUDENT'),
    ('Miguel Oliveira',  'miguel@school.test',       'STUDENT'),
    ('Nuno Ribeiro',     'nuno@school.test',         'STUDENT'),
    ('Rita Gomes',       'rita@school.test',         'STUDENT');
