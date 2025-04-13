import unified from 'unified' // eslint-disable-line import/no-extraneous-dependencies
import math from 'remark-math'

// $ExpectType Processor<Settings>
unified().use(math)
// $ExpectType Processor<Settings>
unified().use(math, {inlineMathDouble: true})
// $ExpectError
// @ts-expect-error TS2322 - Type 'number' is not assignable to type 'boolean | undefined'.
unified().use(math, {inlineMathDouble: 3})
// $ExpectError
// @ts-expect-error TS2353 - Object literal may only specify known properties, and 'invalidProp' does not exist in type 'RemarkMathOptions'.
unified().use(math, {invalidProp: true})
