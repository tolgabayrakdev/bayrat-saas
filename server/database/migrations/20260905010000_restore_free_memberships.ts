import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("plans", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("code", 30).notNullable().unique();
    table.string("name", 100).notNullable();
    table.text("description").notNullable();
    table.boolean("active").notNullable().defaultTo(true);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("subscriptions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable().unique().references("id").inTable("users").onDelete("CASCADE");
    table.uuid("plan_id").notNullable().references("id").inTable("plans");
    table.string("status", 20).notNullable().defaultTo("active");
    table.timestamp("starts_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("ends_at", { useTz: true });
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  const [freePlan] = await knex("plans")
    .insert({
      code: "free",
      name: "Ücretsiz",
      description: "Uygulamanın tüm mevcut özelliklerine erişim",
    })
    .returning("id");

  await knex.raw(
    "INSERT INTO subscriptions (user_id, plan_id) SELECT id, ? FROM users",
    [freePlan.id],
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("subscriptions");
  await knex.schema.dropTableIfExists("plans");
}
