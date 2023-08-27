import { Client, Account, ID, Databases} from "appwrite";

export const client = new Client();

client.setEndpoint('https://cloud.appwrite.io/v1').setProject('64ea7ca35cedfe27f9c5');

export const account = new Account(client);

export const databases = new Databases(client);
