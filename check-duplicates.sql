-- Verificar duplicados em products
SELECT 'products' as table_name, op, batch, COUNT(*) as count 
FROM products 
GROUP BY op, batch 
HAVING COUNT(*) > 1;

-- Verificar duplicados em semi_finished_items  
SELECT 'semi_finished_items' as table_name, op, batch, COUNT(*) as count
FROM semi_finished_items
GROUP BY op, batch 
HAVING COUNT(*) > 1;
