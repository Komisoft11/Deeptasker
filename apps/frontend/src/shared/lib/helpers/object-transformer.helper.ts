export class ObjectTransformerHelper {
  static transformArray<
    R extends Record<string, any>,
    T extends Object = Object
  >(inputArray: T[], mapping: Partial<Record<keyof T, keyof R>>): R[] {
    return inputArray.map((obj) => {
      const transformedObj: R = {} as R
      for (const key in mapping) {
        const newKey = mapping[key]
        // @ts-ignore
        transformedObj[newKey] = obj[key]
      }
      return transformedObj
    })
  }

  static transformObject<
    R extends Record<string, any>,
    T extends Object = Object
  >(obj: T, mapping: Partial<Record<keyof T, string>>): R {
    const transformedObj: R = {} as R
    for (const key in mapping) {
      const newKey = mapping[key] as keyof R
      // @ts-ignore
      transformedObj[newKey] = obj[key]
    }
    return transformedObj
  }
}

// Пример использования
// const inputArray = [
//   { name: 'John', age: 25, city: 'New York' },
//   { name: 'Alice', age: 30, city: 'San Francisco' }
// ]
//
// const transformedArray = ObjectTransformer.transformArray(inputArray, {
//   age: 'fff',
//   city: 'lol'
// })
//
