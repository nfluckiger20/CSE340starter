INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
    )
VALUES (
        'Tony,',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n',
        'Admin'
    );

DELETE FROM public.account
WHERE account_id = 1;

UPDATE
  inventory
SET
  inv_description = 'The GM Hummer gives you a huge interior with a great engine.' 
WHERE
  inv_id = 10;

SELECT inv_make, inv_model, c.classification_name
FROM inventory AS i
INNER JOIN classification AS c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

UPDATE inventory
SET 
    inv_image = CONCAT(SUBSTRING(inv_image, 1, POSITION('/images/' IN inv_image) + 7), 'vehicles/', SUBSTRING(inv_image, POSITION('/images/' IN inv_image) + 8)),
    inv_thumbnail = CONCAT(SUBSTRING(inv_thumbnail, 1, POSITION('/images/' IN inv_thumbnail) + 7), 'vehicles/', SUBSTRING(inv_thumbnail, POSITION('/images/' IN inv_thumbnail) + 8));
