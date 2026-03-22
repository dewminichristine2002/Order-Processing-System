MERGE INTO products (product_id, product_name, stock_quantity, price) KEY (product_id)
VALUES (1, 'Laptop', 50, 1200.00);

MERGE INTO products (product_id, product_name, stock_quantity, price) KEY (product_id)
VALUES (2, 'Monitor', 30, 250.00);
