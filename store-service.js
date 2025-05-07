const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

//connecting database postgres
const sequelize = new Sequelize('demo-database', 'your-database-user', '0tFqa5yEdTxW', {
    host: 'your-database-host', // replace with your database host
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, 
        },
      },
    })


// Models
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Relationships
Item.belongsTo(Category, { foreignKey: 'category' });

// Functions
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve("Database synced successfully"))
            .catch(err => reject("Unable to sync database: " + err));
    });
};

module.exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(() => reject("No results returned"));
    });
};

module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true },
            include: [{ model: Category, as: "category" }],
            order: [["itemDate", "DESC"]],
        })
            .then((items) => {
            
                const formattedItems = items.map((item) => ({
                    ...item.toJSON(),
                    categoryName: item.category ? item.category.category : "Uncategorized", 
                }));
                resolve(formattedItems);
            })
            .catch((err) => reject("No results returned"));
    });
};


module.exports.getItemsByMinDate = (minDateStr) => {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                itemDate: { [gte]: new Date(minDateStr) }
            }
        })
        .then(data => resolve(data))
        .catch(() => reject("No results returned"));
    });
};

module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true } })
            .then(data => resolve(data))
            .catch(() => reject("No published items found"));
    });
};

module.exports.getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true, category },
        })
            .then(data => resolve(data))
            .catch(() => reject("No results returned"));
    });
};


module.exports.getItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.findOne({ where: { id } })
            .then(data => resolve(data))
            .catch(err => reject("Item not found"));
    });
};

module.exports.addItem = (itemData) => {
    itemData.published = itemData.published === "true" ? true : false;

    for (let key in itemData) {
        if (itemData[key] === "") itemData[key] = null;
    }

    itemData.itemDate = new Date();

    return new Promise((resolve, reject) => {
        Item.create(itemData)
            .then(() => resolve())
            .catch(() => reject("Unable to create item"));
    });
};


module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

module.exports.addCategory = (categoryData) => {
    for (let key in categoryData) {
        if (categoryData[key] === "") categoryData[key] = null;
    }

    return new Promise((resolve, reject) => {
        Category.create(categoryData)
            .then(() => resolve())
            .catch(() => reject("Unable to create category"));
    });
};

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id } })
            .then(() => resolve())
            .catch(() => reject("Unable to delete category"));
    });
};

module.exports.deleteItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.destroy({ where: { id } })
            .then(() => resolve())
            .catch(() => reject("Unable to delete item"));
    });
};