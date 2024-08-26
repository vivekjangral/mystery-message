import mongoose from "mongoose";


type ConnectObject = {
    isConnected?: boolean | undefined;
}

const connection: ConnectObject = {}

async function dbConnect() : Promise<void> {
    if (connection.isConnected) {
        console.log(" Already connected to database,  Using existing connection");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

        connection.isConnected = db.connections[0].readyState === 1;
        console.log("Connected to database");
    } catch (error) { 
        console.log("Error connecting to database", error);
        process.exit(1);
     }
}

export default dbConnect;