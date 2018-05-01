
exports.up = function (knex, Promise) {
    return knex.schema.createTable('wallet_tokens', (table) => {
        table.increments('id');
        table.integer('walletId').notNullable().references('wallets.id');
        table.integer('tokenId').notNullable().references('tokens.id');
        table.integer('balance').defaultTo(0);
        table.integer('recordState').defaultTo(1);
        table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updatedAt');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('wallet_tokens');
};
