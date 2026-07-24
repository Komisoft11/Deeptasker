import { Injectable, NotFoundException } from '@nestjs/common'
import {
	HeadObjectCommandOutput,
	NoSuchKey,
	NotFound,
	PutObjectCommandInput,
	PutObjectCommandOutput,
	S3
} from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import type { BufferedFile } from '../interfaces/buffered-file.interface'
import { InjectS3 } from 'nestjs-s3'
import { Readable } from 'stream'
import path from 'path'
import { I18nContext, I18nService } from 'nestjs-i18n'

@Injectable()
export class BucketService {
	private readonly bucket: string

	constructor(
		@InjectS3() private readonly s3: S3,
		private readonly config: ConfigService,
		private readonly i18n: I18nService
	) {
		this.bucket = this.config.get('S3_BUCKET')
	}

	public async upload(file: BufferedFile, filename: string): Promise<number> {
		const params: PutObjectCommandInput = {
			Bucket: this.bucket,
			Key: filename,
			Body: file.buffer
		}

		return new Promise<number>((resolve, reject) => {
			this.s3.putObject(params, (err, data?: PutObjectCommandOutput) => {
				if (err) {
					reject(err.message)
				}
				resolve(data.Size)
			})
		})
	}

	public async getMetadata(objectName: string): Promise<HeadObjectCommandOutput> {
		try {
			return this.s3.headObject({ Bucket: this.bucket, Key: path.basename(objectName) })
		} catch (e) {
			if (e instanceof NotFound || e instanceof NotFound) {
				throw new NotFoundException(
					this.i18n.t('file.file_not_found_in_object_storage', {
						lang: I18nContext.current()?.lang
					})
				)
			}
			throw e
		}
	}

	public async get(objectName: string): Promise<Readable> {
		const params = {
			Bucket: this.bucket,
			Key:objectName
		}

		try {
			const object = await this.s3.getObject(params)

			return object.Body as Readable
		} catch (e) {
			if (e instanceof NoSuchKey) {
				throw new NotFoundException(
					this.i18n.t('file.file_not_found_in_object_storage', {
						lang: I18nContext.current()?.lang
					})
				)
			}
			throw e
		}
	}

	public async delete(objectName: string) {
		const params = {
			Bucket: this.bucket,
			Key: objectName
		}

		return new Promise((resolve, reject) => {
			this.s3.deleteObject(params, (err, data) => {
				if (err) {
					reject(err.message)
				}
				resolve(data)
			})
		})
	}
}
