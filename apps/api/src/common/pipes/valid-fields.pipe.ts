import { ArgumentMetadata, BadRequestException, Injectable, ParseArrayPipe, PipeTransform } from '@nestjs/common'

@Injectable()
export class ValidFieldsPipe<T extends Array<string>> implements PipeTransform<string> {
	constructor(private readonly validFields: T) {}

	async transform(value: string, metadata: ArgumentMetadata) {
		if (!value) {
			return []
		}

		const fields = await new ParseArrayPipe({ items: String, separator: ','}).transform(value, metadata);

		for (const field of fields) {
			if (!this.validFields.includes(field)) {
				throw new BadRequestException(`${field} is not an allowed field`);
			}
		}

		return fields;
	}
}