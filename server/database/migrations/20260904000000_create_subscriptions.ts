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

  await knex.schema.createTable("plan_options", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("plan_id").notNullable().references("id").inTable("plans").onDelete("CASCADE");
    table.string("billing_period", 20).notNullable();
    table.integer("duration_months").notNullable();
    table.integer("price_cents");
    table.string("currency", 3).notNullable().defaultTo("TRY");
    table.unique(["plan_id", "billing_period"]);
  });

  await knex.schema.createTable("subscriptions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable().unique().references("id").inTable("users").onDelete("CASCADE");
    table.uuid("plan_id").notNullable().references("id").inTable("plans");
    table.uuid("plan_option_id").references("id").inTable("plan_options");
    table.string("status", 20).notNullable().defaultTo("active");
    table.timestamp("starts_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("ends_at", { useTz: true });
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  const [freePlan] = await knex("plans").insert({
    code: "free",
    name: "Free",
    description: "Temel özelliklerle ücretsiz kullanım",
  }).returning("id");

  const [premiumPlan] = await knex("plans").insert({
    code: "premium",
    name: "Premium",
    description: "Tüm premium özelliklere erişim",
  }).returning("id");

  await knex("plan_options").insert([
    { plan_id: premiumPlan.id, billing_period: "monthly", duration_months: 1, price_cents: null },
    { plan_id: premiumPlan.id, billing_period: "quarterly", duration_months: 3, price_cents: null },
    { plan_id: premiumPlan.id, billing_period: "yearly", duration_months: 12, price_cents: null },
  ]);

  await knex.raw(
    "INSERT INTO subscriptions (user_id, plan_id) SELECT id, ? FROM users",
    [freePlan.id],
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("subscriptions");
  await knex.schema.dropTableIfExists("plan_options");
  await knex.schema.dropTableIfExists("plans");
}
