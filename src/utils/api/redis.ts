import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

let redis: Promise<RedisClientType>;

const getRedis = (): Promise<RedisClientType> => {
	if (!redis) {
		redis = initRedis();
	}
	return redis;
};

async function initRedis(): Promise<RedisClientType> {
	return new Promise((resolve, reject) => {
		const client = createClient();
		client.on('error', (err) => {
			console.log('Redis Client Error', err);
			reject(err);
		});
		client.connect().then(() => resolve(client as RedisClientType));
	});
}

export async function redisGet<T>(key: string): Promise<T | null> {
	return getRedis()
		.then((client) => client.get(key))
		.then((obj) => {
			if (obj) {
				return JSON.parse(obj);
			} else {
				return null;
			}
		})
		.catch((err) => {
			console.log('redis get error: ', err);
			return null;
		}) as Promise<T | null>;
}

export async function redisSet(key: string, val: any, expiryTimeSeconds?: number): Promise<void> {
	return getRedis()
		.then((client) => {
			if (expiryTimeSeconds) {
				return client.set(key, JSON.stringify(val), { EX: expiryTimeSeconds });
			} else {
				return client.set(key, JSON.stringify(val));
			}
		})
		.catch((err) => {
			console.log('redis set error: ', err);
		}) as Promise<void>;
}
