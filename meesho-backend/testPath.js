require("dotenv").config();
const { mongoose } = require("mongoose");
const { Order } = require("./models/order");

// Helper to make path relative to 'uploads' for storage and response
const makeRelative = (p) => {
    if (!p || typeof p !== "string") return p;
    const parts = p.split(/[\\\/]/);
    const uploadsIdx = parts.findIndex(part => part.toLowerCase() === "uploads");
    if (uploadsIdx !== -1) {
        return parts.slice(uploadsIdx).join("/");
    }
    return p;
};

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        console.log("\n--- Testing Mock Absolute Paths ---");
        const mockPaths = [
            "D:\\meesho-app\\meesho-backend\\uploads\\label-1780127233289-19881746.pdf",
            "/var/www/portal22/meesho-backend/uploads/label-1778931337679-477329751.jpg",
            "uploads\\label-slash.pdf",
            "uploads/label-forward.pdf"
        ];

        mockPaths.forEach(mp => {
            const normalized = makeRelative(mp);
            console.log(`Input:  ${mp}`);
            console.log(`Output: ${normalized}`);
            console.log(`Status: ${normalized.startsWith('uploads/') ? '✅ VERIFIED' : '❌ FAILED'}`);
            console.log('---');
        });

        console.log("\n--- Checking Database for Absolute Paths ---");
        const absoluteOrders = await Order.find({ labelPath: { $regex: /^[A-Z]:/i } }).limit(3);
        const linuxOrders = await Order.find({ labelPath: { $regex: /^\/var/ } }).limit(3);

        const dbTests = [...absoluteOrders, ...linuxOrders];
        if (dbTests.length === 0) {
            console.log("No absolute paths found in database currently.");
        } else {
            dbTests.forEach(ord => {
                const original = ord.labelPath;
                const normalized = makeRelative(original);
                console.log(`DB Input:  ${original}`);
                console.log(`DB Output: ${normalized}`);
                console.log('---');
            });
        }

        console.log("\nTest finished successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
};

test();
