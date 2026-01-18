-- =========================================================
-- 1) RENOMEAR "update_at" -> "updated_at" (SEM QUEBRAR SE JÁ TIVER)--
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'update_at'
  ) THEN
    ALTER TABLE "categories" RENAME COLUMN "update_at" TO "updated_at";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'update_at'
  ) THEN
    ALTER TABLE "products" RENAME COLUMN "update_at" TO "updated_at";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'update_at'
  ) THEN
    ALTER TABLE "orders" RENAME COLUMN "update_at" TO "updated_at";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'update_at'
  ) THEN
    ALTER TABLE "items" RENAME COLUMN "update_at" TO "updated_at";
  END IF;
END $$;

-- USERS (se existir update_at lá também)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'update_at'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "update_at" TO "updated_at";
  END IF;
END $$;


-- =========================================================
-- 2) GARANTIR created_at/updated_at (NOT NULL + DEFAULT)
-- =========================================================
UPDATE "categories" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL;
UPDATE "categories" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

UPDATE "products" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL;
UPDATE "products" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

UPDATE "orders" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL;
UPDATE "orders" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

UPDATE "items" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL;
UPDATE "items" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

-- USERS (se tiver colunas)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'created_at'
  ) THEN
    EXECUTE 'UPDATE "users" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    EXECUTE 'UPDATE "users" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL';
  END IF;
END $$;

ALTER TABLE "categories" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "categories" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "categories" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "products" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "products" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "orders" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "orders" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "items" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "items" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "items" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "items" ALTER COLUMN "updated_at" SET NOT NULL;

-- USERS (se existirem colunas)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'created_at'
  ) THEN
    EXECUTE 'ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP';
    EXECUTE 'ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP';
    EXECUTE 'ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL';
  END IF;
END $$;


-- =========================================================
-- 3) CATEGORIES: name UNIQUE (EVITA CATEGORIA DUPLICADA)
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key'
  ) THEN
    ALTER TABLE "categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");
  END IF;
END $$;


-- =========================================================
-- 4) PRODUCTS: price TEXT -> NUMERIC(10,2) + CHECK
-- =========================================================
ALTER TABLE "products"
ALTER COLUMN "price" TYPE NUMERIC(10,2)
USING (
  replace(
    regexp_replace("price", '[^0-9,.-]', '', 'g'),
    ',',
    '.'
  )::numeric
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_price_positive'
  ) THEN
    ALTER TABLE "products"
    ADD CONSTRAINT "products_price_positive" CHECK ("price" >= 0);
  END IF;
END $$;


-- =========================================================
-- 5) PRODUCTS: adicionar colunas (image + disabled)
-- =========================================================
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "disabled" BOOLEAN NOT NULL DEFAULT false;


-- =========================================================
-- 6) CHECKS IMPORTANTES (EVITA DADO LIXO)
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'items_quantity_positive'
  ) THEN
    ALTER TABLE "items"
    ADD CONSTRAINT "items_quantity_positive" CHECK ("quantity" > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_table_positive'
  ) THEN
    ALTER TABLE "orders"
    ADD CONSTRAINT "orders_table_positive" CHECK ("table" > 0);
  END IF;
END $$;


-- =========================================================
-- 7) AJUSTE: ITENS DUPLICADOS (MESMO produto no mesmo pedido)
--    Junta e soma quantidades para não quebrar a UNIQUE abaixo
-- =========================================================
WITH dup AS (
  SELECT
    "order_id",
    "product_id",
    MIN("id") AS keep_id,
    SUM("quantity") AS total_qty,
    COUNT(*) AS total_rows
  FROM "items"
  GROUP BY "order_id", "product_id"
  HAVING COUNT(*) > 1
)
UPDATE "items" i
SET "quantity" = dup.total_qty
FROM dup
WHERE i."id" = dup.keep_id;

WITH dup AS (
  SELECT
    "order_id",
    "product_id",
    MIN("id") AS keep_id
  FROM "items"
  GROUP BY "order_id", "product_id"
  HAVING COUNT(*) > 1
)
DELETE FROM "items" i
USING dup
WHERE i."order_id" = dup."order_id"
  AND i."product_id" = dup."product_id"
  AND i."id" <> dup.keep_id;


-- =========================================================
-- 8) UNIQUE (order_id + product_id) para não repetir item
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'items_order_product_unique'
  ) THEN
    ALTER TABLE "items"
    ADD CONSTRAINT "items_order_product_unique" UNIQUE ("order_id", "product_id");
  END IF;
END $$;


-- =========================================================
-- 9) FK items.order_id -> CASCADE (evita item órfão)
-- =========================================================
ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "items_order_id_fkey";

ALTER TABLE "items"
ADD CONSTRAINT "items_order_id_fkey"
FOREIGN KEY ("order_id")
REFERENCES "orders"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;


-- =========================================================
-- 10) ÍNDICES (PERFORMANCE)
-- =========================================================
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" ("category_id");
CREATE INDEX IF NOT EXISTS "orders_table_idx" ON "orders" ("table");
CREATE INDEX IF NOT EXISTS "items_order_id_idx" ON "items" ("order_id");
CREATE INDEX IF NOT EXISTS "items_product_id_idx" ON "items" ("product_id");


-- =========================================================
-- 11) USERS: NÃO REPETIR EMAIL E NOME (UNIQUE)
--     (case-insensitive com LOWER)
-- =========================================================
-- EMAIL único (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique_lower_idx"
ON "users"(LOWER("email"));

-- também cria UNIQUE normal no email (case-sensitive), se ainda não tiver
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE "users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");
  END IF;
END $$;

-- NAME único (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS "users_name_unique_lower_idx"
ON "users"(LOWER("name"));


-- =========================================================
-- 12) TRIGGER para updated_at automático (igual @updatedAt do Prisma)
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS categories_set_updated_at ON "categories";
CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON "categories"
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS products_set_updated_at ON "products";
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON "products"
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS orders_set_updated_at ON "orders";
CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON "orders"
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS items_set_updated_at ON "items";
CREATE TRIGGER items_set_updated_at
BEFORE UPDATE ON "items"
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- USERS trigger (só cria se existir coluna updated_at)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS users_set_updated_at ON "users"';
    EXECUTE 'CREATE TRIGGER users_set_updated_at
             BEFORE UPDATE ON "users"
             FOR EACH ROW
             EXECUTE PROCEDURE set_updated_at()';
  END IF;
END $$;
