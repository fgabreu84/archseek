-- Update Museum and Gallery Information - Paris & Saint-Tropez
-- Execute on Supabase: Dashboard → SQL Editor → New Query

UPDATE public.places SET
  description = 'Contemporary art museum in the shape of a sail within a park. Space dedicated to modern and contemporary art with rotating exhibitions.',
  architect = 'Frank Gehry',
  year_built = 2014
WHERE name = 'Fundação Louis Vuitton';

UPDATE public.places SET
  description = 'Historic commercial building transformed into contemporary art space. Houses the François Pinault Collection with modern and contemporary artworks.',
  architect = 'Francesco Stella',
  year_built = 2021
WHERE name = 'Bourse de Commerce - Pinault Collection';

UPDATE public.places SET
  description = 'Contemporary art center featuring avant-garde architecture with innovative glass and steel design. Recently inaugurated with cutting-edge exhibition spaces.',
  architect = 'Herzog & de Meuron',
  year_built = 2024
WHERE name = 'Fundação Cartier para a Arte Contemporânea';

UPDATE public.places SET
  description = 'Belle Époque mansion museum. Displays private art collection with paintings, sculptures and historic furniture in aristocratic residential setting.',
  architect = 'Gabriel-Hippolyte Destailleur',
  year_built = 1875
WHERE name = 'Museu Jacquemart-André';

UPDATE public.places SET
  description = 'Modernist house-studio. Seminal example of modernist architecture featuring open floor plan, ramps and cylindrical surfaces designed by Le Corbusier.',
  architect = 'Le Corbusier',
  year_built = 1925
WHERE name = 'Maison La Roche (Fondation Le Corbusier)';

UPDATE public.places SET
  description = 'Specialized in Claude Monet works and Impressionist art from the 19th century. Houses the famous "Impression, Sunrise" painting that gave the movement its name.',
  architect = 'Jules Coutan',
  year_built = 1882
WHERE name = 'Museu Marmottan Monet';

UPDATE public.places SET
  description = 'Gallery dedicated to Monet''s Water Lilies and early 20th century modern art. Houses the famous series of monumental paintings by Monet.',
  architect = 'Firmin Bourgeois',
  year_built = 1852
WHERE name = 'Musée de l''Orangerie';

UPDATE public.places SET
  description = 'Historic and monumental library. Research space with ornate halls containing manuscripts, rare books and historical documents of French heritage.',
  architect = 'Henri Labrouste',
  year_built = 1854
WHERE name = 'Bibliothèque nationale de France (BnF) | Richelieu';

UPDATE public.places SET
  description = 'Private contemporary art gallery. Space dedicated to contemporary artists and modern art installations with international focus.',
  architect = 'Private gallery space',
  year_built = 1990
WHERE name = 'Perrotin';

UPDATE public.places SET
  description = 'Space dedicated to contemporary art and artistic installations. Gallery for modern and experimental art with emerging artists.',
  architect = 'Unknown',
  year_built = NULL
WHERE name = 'ΠJAMA Galerie';

UPDATE public.places SET
  description = 'Foundation Galleries Lafayettes by OMA. Multidisciplinary cultural center for contemporary art showcasing emerging and established artists in innovative architectural space.',
  architect = 'OMA (Rem Koolhaas)',
  year_built = 2021
WHERE name = 'Lafayette Anticipations';

UPDATE public.places SET
  description = 'Museum dedicated to the history of Paris. Located in Renaissance building, displays art, artifacts and documents about Parisian history and culture.',
  architect = 'Jean-Baptiste Androuet du Cerceau',
  year_built = 1548
WHERE name = 'Museu Carnavalet';

UPDATE public.places SET
  description = 'Historic Paris garden. Public green space with flowers and traditional Parisian landscape design.',
  architect = 'Traditional landscaping',
  year_built = NULL
WHERE name = 'Rosiers Joseph Migneret Garden';

UPDATE public.places SET
  description = 'Historic restored mill in Montmartre. Traditional French mill structure preserved as historical heritage monument.',
  architect = 'Traditional construction',
  year_built = NULL
WHERE name = 'Le Moulin Blute-Fin';

UPDATE public.places SET
  description = 'Museum dedicated to modern and contemporary art. Exhibits works by French and international artists from the 20th century to present day.',
  architect = 'Boileau and Carlu',
  year_built = 1937
WHERE name = 'Museu de Arte Moderna da Cidade de Paris';

UPDATE public.places SET
  description = 'Historic Renaissance mansion. One of the few preserved civil buildings from the 15th century in Paris. Now used as cultural venue.',
  architect = 'Medieval/Renaissance architecture',
  year_built = 1475
WHERE name = 'Hôtel de Sens';

UPDATE public.places SET
  description = 'French national archives building. Historic edifice preserving national documents in architecturally significant location of great cultural importance.',
  architect = 'Traditional French architecture',
  year_built = NULL
WHERE name = 'Archives Nationales';

UPDATE public.places SET
  description = 'Historic fortress with maritime history museum. Preserved defensive structure with collection of naval artifacts and local historical heritage.',
  architect = 'Military construction',
  year_built = 1602
WHERE name = 'Citadelle de Saint-Tropez - Musée d''histoire maritime';
