const session = require("express-session");
const connectDB = require("./dbConnect");

class MongoSessionStore extends session.Store {
    constructor() {
        super();
        this.collectionName = "sessions";
    }

    async getCollection() {
        const db = await connectDB();
        return db.collection(this.collectionName);
    }

    // Get session by session ID
    async get(sid, callback) {
        try {
            const collection = await this.getCollection();
            const session = await collection.findOne({ sid });

            if (!session) return callback(null, null);

            // Check if session is expired
            if (session.expires && new Date() > new Date(session.expires)) {
                await collection.deleteOne({ sid });
                return callback(null, null);
            }

            callback(null, session.data);
        } catch (error) {
            callback(error);
        }
    }

    // Save/update session
    async set(sid, sessionData, callback) {
        try {
            const collection = await this.getCollection();
            const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day

            await collection.updateOne(
                { sid },
                { $set: { sid, data: sessionData, expires } },
                { upsert: true }
            );

            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    // Delete session
    async destroy(sid, callback) {
        try {
            const collection = await this.getCollection();
            await collection.deleteOne({ sid });
            callback(null);
        } catch (error) {
            callback(error);
        }
    }
}

module.exports = MongoSessionStore;