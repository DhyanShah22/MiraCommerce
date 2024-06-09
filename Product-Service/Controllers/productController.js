const { default: mongoose} = require('mongoose')

const Product = require('../Models/productModels')

const logger = require('../Logger/logger')
const { getCache, setCache } = require('../Services/redisService')

const getProduct = async (req, res) => {
    logger.info('Fetching Products')
    const cachedProducts = await getCache('products')
    if (cachedProducts) {
        logger.info('Returning cached Products');
        logger.info(cachedProducts) // Log cached data
        const parsedProducts = JSON.parse(cachedProducts);
        logger.info('Parsed cached Products');
        logger.info(parsedProducts) // Log parsed data
        return res.status(201).json(parsedProducts);
    }
    logger.info('Fetchinf Products From DB..')
    const products = await Product.find({}).sort({createdAt: -1})
    logger.info('Caching Products..')
    await setCache('products', products)   
    logger.info(products) 
    return res.status(200).json(products)
}

const getProductById = async (req, res) => {
    const {id} = req.params 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Not a valid DB id' });
    }

    const cachedProducts = await getCache(`product:${id}`)
    if(cachedProducts) {
        return res.status(200).json(JSON.parse(cachedProducts))
    }

    const product = await Product.findById(id)

    if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
    }

    logger.info('Cacging Product...')
    setCache(`product:${id}`, product)
    logger.info(product)
    return res.status(200).json(product)
}

const createProduct = async(req, res) => {
    const { Name, Description, Price, Stock } = req.body

    const SellerId = req.user._id
    logger.info(req.user._id)

    try {
        const product = new Product({ Name, Description, Price, Stock, SellerId})
        await product.save()
        logger.info('Product Created!!!')
        res.status(201).json({ message: 'Product Created: ', product})
    }
    catch(error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error })
    }
}

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { Name, Description, Price, Stock } = req.body;
    const SellerId = req.user._id; // Authenticated user's ID

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.SellerId.toString() !== SellerId) {
            return res.status(403).json({ message: 'Unauthorized to update this product' });
        }

        product.Name = Name || product.Name;
        product.Description = Description || product.Description;
        product.Price = Price || product.Price;
        product.Stock = Stock || product.Stock;

        await product.save();
        logger.info('Product Updating')
        res.status(200).json({ message: 'Product updated', product });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const SellerId = req.user._id; // Authenticated user's ID

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.SellerId.toString() !== SellerId) {
            return res.status(403).json({ message: 'Unauthorized to delete this product' });
        }

        await product.remove();
        logger.info('Product Deleted')
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Server error', error });
    }
};


module.exports = {
    getProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}