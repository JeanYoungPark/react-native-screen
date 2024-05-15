import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const config = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.jsm.aora",
    projectId: "6641b18000301faeb733",
    databaseId: "6641b4d9000761f8cbdf",
    userCollectionId: "6641b4fc0031548dfe56",
    videoCollectionId: "6641b52d00188e5d4694",
    storage: "6641bb700002bd23d159",
};

const { endpoint, platform, projectId, databaseId, userCollectionId, videoCollectionId, storage } = config;
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId); // Your project ID
// .setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatar = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username);
        if (!newAccount) throw Error;

        const avatarUrl = avatar.getInitials(username);
        await signIn(email, password);

        const newUser = await databases.createDocument(databaseId, userCollectionId, ID.unique(), {
            accountId: newAccount.$id,
            email,
            username,
            avatar: avatarUrl,
        });

        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw new Error(error);
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(databaseId, userCollectionId, [Query.equal("accountId", currentAccount.$id)]);
        if (!currentUser) throw Error;
        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
};

export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(databaseId, videoCollectionId);
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
};

export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc("$createdAt", Query.limit(7))]);
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
};

export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.search("title", query)]);
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
};

export const getUserPosts = async (userId) => {
    try {
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.equal("creator", userId)]);
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
};

export const signOut = async () => {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        throw new Error(error);
    }
};
