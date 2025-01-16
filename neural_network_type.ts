const typeEqual = <T1 extends T2, T2 extends Q, Q = T1>(): void => undefined as any;

type ListOfLength<Len extends number, List extends unknown[] = []> =
    List extends { length: Len }
        ? List
        : ListOfLength<Len, [unknown, ...List]>;

type Length<List extends any[]> =
    List extends { length: infer Len extends number }
        ? Len
        : never;

type Increment<Number extends number> = Length<[...ListOfLength<Number>, unknown]>;

type Decrement<Number extends number> =
    ListOfLength<Number> extends [unknown, ...ListOfLength<infer NewNumber>]
        ? NewNumber
        : never;

// Assume positive integers.
type Max<Number1 extends number, Number2 extends number> =
    ListOfLength<Number1> extends [...ListOfLength<Number2>, ...ListOfLength<infer _>]
        ? Number1
        : Number2;

// Assume positive integers.
type Greater<Num1 extends number, Num2 extends number> =
    ListOfLength<Num1> extends [...ListOfLength<Num2>, ...ListOfLength<infer Difference extends number>]
        ? Difference extends 0
            ? false
            : true
        : false;

typeEqual<Greater<4, 3>, true>();
typeEqual<Greater<3, 3>, false>();
typeEqual<Greater<0, 3>, false>();

type Not<B extends boolean> =
    B extends true
        ? false
        : true;

type And<B1 extends boolean, B2 extends boolean> =
    B1 extends true
        ? B2 extends true
            ? true
            : false
        : false;

type Xor<B1 extends boolean, B2 extends boolean> =
    B1 extends true
        ? B2 extends true
            ? true
            : false
        : B2 extends true
            ? false
            : true;

type Or<B1 extends boolean, B2 extends boolean> =
    B1 extends true
        ? true
        : B2 extends true
            ? true
            : false;

typeEqual<And<false, false>, false>();
typeEqual<And<true, false>, false>();
typeEqual<And<false, true>, false>();
typeEqual<And<true, true>, true>();

typeEqual<Xor<false, false>, true>();
typeEqual<Xor<true, false>, false>();
typeEqual<Xor<false, true>, false>();
typeEqual<Xor<true, true>, true>();

typeEqual<Or<false, false>, false>();
typeEqual<Or<true, false>, true>();
typeEqual<Or<false, true>, true>();
typeEqual<Or<true, true>, true>();

type FullAdder<B1 extends boolean, B2 extends boolean, Carry extends boolean> =
    { sum: Xor<Carry, Xor<B1, B2>>, carry: Or<Or<And<B1, B2>, And<B2, Carry>>, And<B1, Carry>> };

typeEqual<FullAdder<false, false, false>, { sum: false, carry: false }>();
typeEqual<FullAdder<false, true, false>, { sum: true, carry: false }>();
typeEqual<FullAdder<true, false, false>, { sum: true, carry: false }>();
typeEqual<FullAdder<false, false, true>, { sum: true, carry: false }>();
typeEqual<FullAdder<false, true, true>, { sum: false, carry: true }>();
typeEqual<FullAdder<true, true, false>, { sum: false, carry: true }>();
typeEqual<FullAdder<true, true, true>, { sum: true, carry: true }>();

type AddBits<Number1 extends boolean[], Number2 extends boolean[], Carry extends boolean = false, Acc extends boolean[] = []> =
    Number1 extends { length: infer NBits }
        ? Number2 extends { length: NBits }
            ? Number1 extends [...(infer Rem1 extends boolean[]), infer Bit1 extends boolean]
                ? Number2 extends [...(infer Rem2 extends boolean[]), infer Bit2 extends boolean]
                    ? FullAdder<Bit1, Bit2, Carry> extends {
                            sum: infer BitSum extends boolean,
                            carry: infer BitCarry extends boolean
                        }
                        ? AddBits<Rem1, Rem2, BitCarry, [BitSum, ...Acc]>
                        // Unreachable
                        : never
                    // Unreachable
                    : never
                : { sum: Acc, carry: Carry }
            : never
        : never;

typeEqual<AddBits<[true], [true]>, { sum: [false], carry: true }>();
typeEqual<AddBits<[true, false, true], [true, false, false]>, { sum: [false, false, true], carry: true }>();

// Assume Bits is shorter than TargetLength.
type PadLeft<Bits extends boolean[], TargetLength extends number> =
    Bits extends { length: TargetLength }
        ? Bits
        : PadLeft<[false, ...Bits], TargetLength>;

typeEqual<PadLeft<[true, false], 4>, [false, false, true, false]>();

type AddBitsVariableSize<Number1 extends boolean[], Number2 extends boolean[]> =
    Number1 extends { length: infer NBits1 extends number }
        ? Number2 extends { length: infer NBits2 extends number }
            ? AddBits<
                PadLeft<Number1, Max<NBits1, NBits2>>,
                PadLeft<Number2, Max<NBits1, NBits2>>
            > extends { sum: infer Sum extends boolean[], carry: infer Carry extends boolean }
                ? [Carry, ...Sum]
                : never
            : never
        : never;

typeEqual<AddBitsVariableSize<[true, true], [true]>, [true, false, false]>();
typeEqual<AddBitsVariableSize<[false, true], [true]>, [false, true, false]>();

type MultiplyBitsWithBit<Left extends boolean[], Right extends boolean, Product extends boolean[] = []> =
    Left extends [infer Bit extends boolean, ...(infer Remainder extends boolean[])]
        ? MultiplyBitsWithBit<Remainder, Right, [...Product, And<Bit, Right>]>
        : Product;

typeEqual<MultiplyBitsWithBit<[true, false, false], true>, [true, false, false]>();
typeEqual<MultiplyBitsWithBit<[true, false, false], false>, [false, false, false]>();

type ShiftLeft<Bits extends boolean[]> = [...Bits, false];

typeEqual<ShiftLeft<[true, false, true]>, [true, false, true, false]>();

type ShiftLeftNTimes<Bits extends boolean[], N extends number> =
    N extends 0
        ? Bits
        : ShiftLeftNTimes<ShiftLeft<Bits>, Decrement<N>>;

typeEqual<ShiftLeftNTimes<[true, false], 3>, [true, false, false, false, false]>();

type TruncateFalseLeft<Bits extends boolean[]> =
    Bits extends [false]
        ? Bits
        : Bits extends [false, ...(infer RemainingBits extends boolean[])]
            ? TruncateFalseLeft<RemainingBits>
            : Bits;

typeEqual<TruncateFalseLeft<[false, false, true, false]>, [true, false]>();
typeEqual<TruncateFalseLeft<[true, false, true, false]>, [true, false, true, false]>();

type TruncateLeft<Bits extends boolean[], TargetLength extends number> =
    Bits extends { length: infer Length extends number }
        ? Greater<Length, TargetLength> extends true
            ? Bits extends [boolean, ...(infer Remainder extends boolean[])]
                ? TruncateLeft<Remainder, TargetLength>
                : never
            : Bits
        : never;

typeEqual<TruncateLeft<[false, false, true, false], 1>, [false]>();
typeEqual<TruncateLeft<[true, false, true, false], 3>, [false, true, false]>();

// Assume bits represent unsigned integers. Algorithm cannot overflow.
type MultiplyBits<Number1 extends boolean[], Number2 extends boolean[], Product extends boolean[] = [false], CurrentIndex extends number = 0> =
    Number2 extends [...(infer Remainder extends boolean[]), infer Bit extends boolean]
        // The extends helps with "infinitely deep" recursion.
        ? ShiftLeftNTimes<MultiplyBitsWithBit<Number1, Bit>, CurrentIndex> extends (infer Summand extends boolean[])
            ? MultiplyBits<Number1, Remainder, AddBitsVariableSize<Product, Summand>, Increment<CurrentIndex>>
            : never
        : Product

typeEqual<TruncateFalseLeft<MultiplyBits<[false, true, true], [false, true, false]>>, [true, true, false]>();
typeEqual<TruncateFalseLeft<MultiplyBits<[false, false, true, true], [false, false, true, false]>>, [true, true, false]>();
typeEqual<TruncateFalseLeft<MultiplyBits<[false, false, true, true], [false, false, true, true]>>, [true, false, false, true]>();
typeEqual<TruncateFalseLeft<MultiplyBits<[false, false, false, true, true, false, false, false], [false, false, false, true, true, false, false, false]>>, [true, false, false, true, false, false, false, false, false, false]>();
typeEqual<TruncateFalseLeft<MultiplyBits<[false, false, false, false, false, false, false, false], [false, false, false, true, true, false, false, false]>>, [false]>();

type GreaterBits<Number1 extends boolean[], Number2 extends boolean[]> =
    Number1 extends { length: infer Len }
        ? Number2 extends { length: Len }
            ? Len extends 0
                ? false
                : Number1 extends [infer Bit1 extends boolean, ...infer Rem1 extends boolean[]]
                    ? Number2 extends [infer Bit2 extends boolean, ...infer Rem2 extends boolean[]]
                        ? Xor<Bit1, Bit2> extends true
                            ? GreaterBits<Rem1, Rem2>
                            : Bit1
                        : never
                    : never
            : never
        : never;

typeEqual<GreaterBits<[], []>, false>();
typeEqual<GreaterBits<[false, false], [false, false]>, false>();
typeEqual<GreaterBits<[true, false, false], [false, false]>, never>();
typeEqual<GreaterBits<[true, false, false], [false, true, false]>, true>();
typeEqual<GreaterBits<[true, true, false], [true, true, true]>, false>();
typeEqual<GreaterBits<[true, true, true], [true, true, false]>, true>();

type BinaryNumberType<Size extends number, Result extends boolean[] = []> =
    Result extends { length: Size }
        ? Result
        : BinaryNumberType<Size, [boolean, ...Result]>;

typeEqual<BinaryNumberType<3>, [boolean, boolean, boolean]>();

type Int8 = BinaryNumberType<8>;

type InvertBits<Number extends boolean[], Result extends boolean[] = []> =
    Number extends [infer Bit extends boolean, ...(infer Remainder extends boolean[])]
        ? Bit extends true
            ? InvertBits<Remainder, [...Result, false]>
            : Bit extends false
                ? InvertBits<Remainder, [...Result, true]>
                : never
        : Result;

typeEqual<InvertBits<[true, false]>, [false, true]>();

// Assume B is a byte with a value between 1 and 128.
type TwosComplement<B extends Int8> =
    AddBits<InvertBits<B>, [false, false, false, false, false, false, false, true]>['sum'];

type BitsToInt8<Num extends boolean[]> =
    Num extends { length: 8 }
        ? Num
        : Greater<8, Length<Num>> extends true
            ? PadLeft<Num, 8>
            : TruncateLeft<Num, 8>;

typeEqual<BitsToInt8<[false, true, true, true, true, true, true, true]>, [false, true, true, true, true, true, true, true]>();
typeEqual<BitsToInt8<[false, true, false, true, true, true, true, true, true, true]>, [false, true, true, true, true, true, true, true]>();
typeEqual<BitsToInt8<[true, true, true, true, true]>, [false, false, false, true, true, true, true, true]>();
typeEqual<BitsToInt8<[false]>, [false, false, false, false, false, false, false, false]>();

type IsInteger<Num extends number> =
    `${Num}` extends `${number}.${number}`
        ? false
        : `${Num}` extends `${number}e-${number}`
            ? false
            : true;

type PositiveDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Digit = 0 | PositiveDigit;
type OneDigitSignedIntDecimal = `${Digit}` | `-${PositiveDigit}`;
type TwoDigitSignedIntDecimal = `${PositiveDigit}${Digit}` | `-${PositiveDigit}${Digit}`;
type ThreeDigitInt8Decimal =
    `1${1 | 2}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`
    | `-1${1 | 2}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;
type Int8Decimal = OneDigitSignedIntDecimal | TwoDigitSignedIntDecimal | ThreeDigitInt8Decimal;

type CanBeRepresentedAsByte<Number extends number> =
    `${Number}` extends Int8Decimal
        ? true
        : false;

typeEqual<CanBeRepresentedAsByte<5>, true>();
typeEqual<CanBeRepresentedAsByte<-6>, true>();
typeEqual<CanBeRepresentedAsByte<-35>, true>();
typeEqual<CanBeRepresentedAsByte<42>, true>();
typeEqual<CanBeRepresentedAsByte<127>, true>();
typeEqual<CanBeRepresentedAsByte<-128>, true>();
typeEqual<CanBeRepresentedAsByte<128>, false>();
typeEqual<CanBeRepresentedAsByte<-129>, false>();

type Int8PositionIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // 8 represents "0" (kind of).
type Int8PositionValue = [128, 64, 32, 16, 8, 4, 2, 1];

type IncrementIndex<Index extends Int8PositionIndex> = Increment<Index> & Int8PositionIndex;

type PositiveIntegerToInt8<Integer extends number, Result extends boolean[] = [], Remainder extends unknown[] = ListOfLength<Integer>, StepIdx extends Int8PositionIndex = 0> =
    StepIdx extends 8
        ? Result
        : Remainder extends [...ListOfLength<Int8PositionValue[StepIdx]>, ...ListOfLength<infer NewRemainderValue>]
            // Able to subtract something.
            ? PositiveIntegerToInt8<Integer, [...Result, true], ListOfLength<NewRemainderValue>, IncrementIndex<StepIdx>>
            // Not able to subtract something.
            : PositiveIntegerToInt8<Integer, [...Result, false], Remainder, IncrementIndex<StepIdx>>;

// Assume Integer is an integer between -128 and 127.
type IntegerToInt8<Integer extends number> =
    `${Integer}` extends `-${infer PositiveInteger extends number}`
        ? TwosComplement<PositiveIntegerToInt8<PositiveInteger>>
        : PositiveIntegerToInt8<Integer>;

typeEqual<IntegerToInt8<127>, [false, true, true, true, true, true, true, true]>();
typeEqual<IntegerToInt8<7>, [false, false, false, false, false, true, true, true]>();
typeEqual<IntegerToInt8<-1>, [true, true, true, true, true, true, true, true]>();
typeEqual<IntegerToInt8<-128>, [true, false, false, false, false, false, false, false]>();
typeEqual<IntegerToInt8<0>, [false, false, false, false, false, false, false, false]>();
typeEqual<IntegerToInt8<-0>, [false, false, false, false, false, false, false, false]>();

type NumberToInt8<Number extends number> =
    IsInteger<Number> extends false
        ? never
        : CanBeRepresentedAsByte<Number> extends false
            ? never
            : IntegerToInt8<Number>;

typeEqual<NumberToInt8<127>, [false, true, true, true, true, true, true, true]>();
typeEqual<NumberToInt8<128>, never>();
typeEqual<NumberToInt8<-128>, [true, false, false, false, false, false, false, false]>();
typeEqual<NumberToInt8<-129>, never>();

// We ignore overflows.
type AddInt8<Num1 extends Int8, Num2 extends Int8> = AddBits<Num1, Num2>['sum'];

type SubtractInt8<Num1 extends Int8, Num2 extends Int8> = AddBits<Num1, TwosComplement<Num2>>['sum'];

typeEqual<AddInt8<NumberToInt8<12>, NumberToInt8<20>>, NumberToInt8<32>>();
typeEqual<AddInt8<NumberToInt8<-12>, NumberToInt8<20>>, NumberToInt8<8>>();
typeEqual<SubtractInt8<NumberToInt8<-12>, NumberToInt8<20>>, NumberToInt8<-32>>();
typeEqual<SubtractInt8<NumberToInt8<-12>, NumberToInt8<-20>>, NumberToInt8<8>>();

type Int8IsNegative<Num extends Int8> =
    Num[0] extends true
        ? true
        : false;

type AbsoluteInt8<Num extends Int8> =
    Int8IsNegative<Num> extends true
        ? TwosComplement<Num>
        : Num;

typeEqual<AbsoluteInt8<NumberToInt8<0>>, NumberToInt8<0>>();
typeEqual<AbsoluteInt8<NumberToInt8<-2>>, NumberToInt8<2>>();
typeEqual<AbsoluteInt8<NumberToInt8<2>>, NumberToInt8<2>>();

// Lots of additional extends to avoid "infinite depth" recursion errors.
// We have to be more explicit to help the type inference.
type MultiplyInt8<Num1 extends Int8, Num2 extends Int8> =
    MultiplyBits<AbsoluteInt8<Num1>, AbsoluteInt8<Num2>> extends (infer Product extends boolean[])
        ? BitsToInt8<Product> extends (infer ProductInt8 extends Int8)
            // If both are negative or positive, then the product is positive, otherwise it is negative.
            ? Xor<Int8IsNegative<Num1>, Int8IsNegative<Num2>> extends true
                ? ProductInt8
                : TwosComplement<ProductInt8>
            : never
        : never;

typeEqual<MultiplyInt8<NumberToInt8<5>, NumberToInt8<4>>, NumberToInt8<20>>();
typeEqual<MultiplyInt8<NumberToInt8<5>, NumberToInt8<-4>>, NumberToInt8<-20>>();
typeEqual<MultiplyInt8<NumberToInt8<-5>, NumberToInt8<-4>>, NumberToInt8<20>>();
typeEqual<MultiplyInt8<NumberToInt8<-5>, NumberToInt8<4>>, NumberToInt8<-20>>();
typeEqual<MultiplyInt8<NumberToInt8<-5>, NumberToInt8<0>>, NumberToInt8<0>>();
typeEqual<MultiplyInt8<NumberToInt8<-5>, NumberToInt8<1>>, NumberToInt8<-5>>();

type GreaterInt8<Num1 extends Int8, Num2 extends Int8> =
    Num1 extends [true, ...boolean[]]
        // Num1 negative
        ? Num2 extends [true, ...boolean[]]
            // Num1 negative, Num2 negative
            ? Not<GreaterBits<TwosComplement<Num1>, TwosComplement<Num2>>>
            // Num1 negative, Num2 positive
            : false
        : Num2 extends [true, ...boolean[]]
            // Num1 positive, Num2 negative
            ? true
            // Num1 positive, Num2 positive
            : GreaterBits<Num1, Num2>;

typeEqual<GreaterInt8<NumberToInt8<8>, NumberToInt8<4>>, true>();
typeEqual<GreaterInt8<NumberToInt8<8>, NumberToInt8<-4>>, true>();
typeEqual<GreaterInt8<NumberToInt8<-8>, NumberToInt8<4>>, false>();
typeEqual<GreaterInt8<NumberToInt8<-8>, NumberToInt8<-4>>, false>();
typeEqual<GreaterInt8<NumberToInt8<2>, NumberToInt8<2>>, false>();

// FixedWidthDecimal is represented by a signed byte.
// The decimal has the following structure:
// Sign-Bit [4 Bits Integer].[3 Bits Fractional]
// The value range is -16 to (15 + 7/8).
type FixedWidthDecimal = Int8;

type FractionalComponentToBinary<Num extends number>
    = `${Num}` extends '125'
    ? [false, false, true]
    : `${Num}` extends '25'
        ? [false, true, false]
        : `${Num}` extends '375'
            ? [false, true, true]
            : `${Num}` extends '5'
                ? [true, false, false]
                : `${Num}` extends '625'
                    ? [true, false, true]
                    : `${Num}` extends '75'
                        ? [true, true, false]
                        : `${Num}` extends '875'
                            ? [true, true, true]
                            : never;

type IntegerComponentToBinary<Num extends number> =
    TruncateFalseLeft<PositiveIntegerToInt8<Num>> extends (infer Bits extends boolean[])
        ? Bits
        : never;

// The type system needs a lot of help to do any kind of work here.
type NumberToFixedWidthDecimal<Number extends number> =
    `${Number}` extends `-${infer PositiveIntegerComponent extends number}.${infer FractionalComponent extends number}`
        // Negative decimal
        ? IntegerComponentToBinary<PositiveIntegerComponent> extends (infer IntegerBits extends boolean[])
            ? FractionalComponentToBinary<FractionalComponent> extends (infer FractionalBits extends boolean[])
                ? BitsToInt8<[...IntegerBits, ...FractionalBits]> extends (infer PositiveBits extends Int8)
                    ? TwosComplement<PositiveBits>
                    : never
                : never
            : never
        // Positive decimal
        : `${Number}` extends `${infer IntegerComponent extends number}.${infer FractionalComponent extends number}`
            ? IntegerComponentToBinary<IntegerComponent> extends (infer IntegerBits extends boolean[])
                ? FractionalComponentToBinary<FractionalComponent> extends (infer FractionalBits extends boolean[])
                    ? BitsToInt8<[...IntegerBits, ...FractionalBits]>
                    : never
                : never
            // Negative integer
            : `${Number}` extends `-${infer PositiveIntegerComponent extends number}`
                ? IntegerComponentToBinary<PositiveIntegerComponent> extends (infer IntegerBits extends boolean[])
                    ? BitsToInt8<[...IntegerBits, false, false, false]> extends (infer PositiveBits extends Int8)
                        ? TwosComplement<PositiveBits>
                        : never
                    : never
                // Positive integer
                : `${Number}` extends `${infer IntegerComponent extends number}`
                    ? IntegerComponentToBinary<IntegerComponent> extends (infer IntegerBits extends boolean[])
                        ? BitsToInt8<[...IntegerBits, false, false, false]>
                        : never
                    : never;

typeEqual<NumberToFixedWidthDecimal<1.5>, [false, false, false, false, true, true, false, false]>();
typeEqual<NumberToFixedWidthDecimal<1>, [false, false, false, false, true, false, false, false]>();
typeEqual<NumberToFixedWidthDecimal<-1>, [true, true, true, true, true, false, false, false]>();
typeEqual<NumberToFixedWidthDecimal<-1.5>, [true, true, true, true, false, true, false, false]>();
typeEqual<NumberToFixedWidthDecimal<0.5>, [false, false, false, false, false, true, false, false]>();
typeEqual<NumberToFixedWidthDecimal<3>, [false, false, false, true, true, false, false, false]>();
typeEqual<NumberToFixedWidthDecimal<9>, [false, true, false, false, true, false, false, false]>();
typeEqual<NumberToFixedWidthDecimal<-9>, [true, false, true, true, true, false, false, false]>();
typeEqual<NumberToFixedWidthDecimal<-0.5>, [true, true, true, true, true, true, false, false]>();

// Addition and subtraction is the same as for Int8.
type AddFixedWidthDecimal<Num1 extends FixedWidthDecimal, Num2 extends FixedWidthDecimal> = AddInt8<Num1, Num2>;
type SubtractFixedWidthDecimal<Num1 extends FixedWidthDecimal, Num2 extends FixedWidthDecimal> = SubtractInt8<Num1, Num2>;

typeEqual<AddFixedWidthDecimal<NumberToFixedWidthDecimal<2>, NumberToFixedWidthDecimal<1>>, NumberToFixedWidthDecimal<3>>();
typeEqual<AddFixedWidthDecimal<NumberToFixedWidthDecimal<-2>, NumberToFixedWidthDecimal<1>>, NumberToFixedWidthDecimal<-1>>();
typeEqual<AddFixedWidthDecimal<NumberToFixedWidthDecimal<-2.5>, NumberToFixedWidthDecimal<1>>, NumberToFixedWidthDecimal<-1.5>>();
typeEqual<AddFixedWidthDecimal<NumberToFixedWidthDecimal<-2>, NumberToFixedWidthDecimal<1.5>>, NumberToFixedWidthDecimal<-0.5>>();

typeEqual<SubtractFixedWidthDecimal<NumberToFixedWidthDecimal<2>, NumberToFixedWidthDecimal<1>>, NumberToFixedWidthDecimal<1>>();
typeEqual<SubtractFixedWidthDecimal<NumberToFixedWidthDecimal<-2>, NumberToFixedWidthDecimal<1>>, NumberToFixedWidthDecimal<-3>>();
typeEqual<SubtractFixedWidthDecimal<NumberToFixedWidthDecimal<-2.5>, NumberToFixedWidthDecimal<1>>, NumberToFixedWidthDecimal<-3.5>>();

// Multiplication results of FixedWidthDecimal results in the radix being shifted left by 3 (from 3 to 6), for example:
// 3/4 = 00000.110
// 3/2 = 00001.100
// Int8 multiplication: 00000110 * 00001100 = 01001000 (= 72)
// Desired result: 00001.001 (= 9/8)
// To avoid reduction in precision,
// 1. perform unrestricted bits multiplication on the absolute Int8s
// 2. truncate 3 from the right
// 3. convert to Int8
// 4. apply two's complement if necessary.
type MultiplyFixedWidthDecimal<Num1 extends FixedWidthDecimal, Num2 extends FixedWidthDecimal> =
    MultiplyBits<AbsoluteInt8<Num1>, AbsoluteInt8<Num2>> extends (infer Product extends boolean[])
        ? Product extends [...(infer Remainder extends boolean[]), boolean, boolean, boolean]
            ? BitsToInt8<Remainder> extends (infer ProductInt8 extends Int8)
                ? Xor<Int8IsNegative<Num1>, Int8IsNegative<Num2>> extends true
                    ? ProductInt8
                    : TwosComplement<ProductInt8>
                : never
            : never
        : never;

typeEqual<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<2>, NumberToFixedWidthDecimal<1>>, NumberToFixedWidthDecimal<2>>();
typeEqual<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<1>, NumberToFixedWidthDecimal<10>>, NumberToFixedWidthDecimal<10>>();
typeEqual<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<1.5>, NumberToFixedWidthDecimal<3>>, NumberToFixedWidthDecimal<4.5>>();
typeEqual<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<-1.5>, NumberToFixedWidthDecimal<3>>, NumberToFixedWidthDecimal<-4.5>>();
typeEqual<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<-3>, NumberToFixedWidthDecimal<3>>, NumberToFixedWidthDecimal<-9>>();
typeEqual<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<-2>, NumberToFixedWidthDecimal<1.5>>, NumberToFixedWidthDecimal<-3>>();
typeEqual<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<-2>, NumberToFixedWidthDecimal<0>>, NumberToFixedWidthDecimal<0>>();
typeEqual<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<0>, NumberToFixedWidthDecimal<2>>, NumberToFixedWidthDecimal<0>>();

type Vector = FixedWidthDecimal[];

type ArrayToVector<Array extends number[], Vec extends Vector = []> =
    Array extends [infer Num extends number, ...infer Rem extends number[]]
        ? ArrayToVector<Rem, [...Vec, NumberToFixedWidthDecimal<Num>]>
        : Vec;

typeEqual<ArrayToVector<[3, -2]>, [NumberToFixedWidthDecimal<3>, NumberToFixedWidthDecimal<-2>]>();
typeEqual<ArrayToVector<[3, -2]>, [NumberToFixedWidthDecimal<3>, NumberToFixedWidthDecimal<-2>]>();
typeEqual<ArrayToVector<[-2, 1.5]>, [NumberToFixedWidthDecimal<-2>, NumberToFixedWidthDecimal<1.5>]>();

// Assume Size is a positive integer or 0.
type ZeroVector<Size extends number, Vec extends Vector = []> =
    Vec extends { length: Size }
        ? Vec
        : ZeroVector<Size, [...Vec, NumberToFixedWidthDecimal<0>]>;

typeEqual<ZeroVector<3>, ArrayToVector<[0, 0, 0]>>();

// Assume Size is a positive integer greater 0. Assume index is in {0, ..., Size - 1}.
type UnitVector<Size extends number, Index extends number, Vec extends Vector = []> =
    Vec extends { length: (infer CurrentSize extends number) }
        ? CurrentSize extends Size
            ? Vec
            : CurrentSize extends Index
                ? UnitVector<Size, Index, [...Vec, NumberToFixedWidthDecimal<1>]>
                : UnitVector<Size, Index, [...Vec, NumberToFixedWidthDecimal<0>]>
        : never;

typeEqual<UnitVector<3, 1>, ArrayToVector<[0, 1, 0]>>();
typeEqual<UnitVector<5, 4>, ArrayToVector<[0, 0, 0, 0, 1]>>();

type ScalarVectorMultiply<Scalar extends FixedWidthDecimal, Vec extends Vector, Result extends Vector = []> =
    Vec extends [infer Element extends FixedWidthDecimal, ...infer Rem extends FixedWidthDecimal[]]
        ? ScalarVectorMultiply<Scalar, Rem, [...Result, MultiplyFixedWidthDecimal<Scalar, Element>]>
        : Result;

typeEqual<ScalarVectorMultiply<NumberToFixedWidthDecimal<2>, ArrayToVector<[1, 2.5, 3]>>, ArrayToVector<[2, 5, 6]>>();

type VectorAdd<Vec1 extends Vector, Vec2 extends Vector, Sum extends Vector = []> =
    Vec1 extends [infer Field1 extends FixedWidthDecimal, ...(infer Rem1 extends FixedWidthDecimal[])]
        ? Vec2 extends [infer Field2 extends FixedWidthDecimal, ...(infer Rem2 extends FixedWidthDecimal[])]
            ? VectorAdd<Rem1, Rem2, [...Sum, AddFixedWidthDecimal<Field1, Field2>]>
            : never
        : Sum;

typeEqual<VectorAdd<[], []>, []>();
typeEqual<VectorAdd<ArrayToVector<[5, -2]>, ArrayToVector<[-0.5, 1.5]>>, [NumberToFixedWidthDecimal<4.5>, NumberToFixedWidthDecimal<-0.5>]>();

type VectorPointwiseMultiply<Vec1 extends Vector, Vec2 extends Vector, Product extends Vector = []> =
    Vec1 extends [infer Field1 extends FixedWidthDecimal, ...(infer Rem1 extends FixedWidthDecimal[])]
        ? Vec2 extends [infer Field2 extends FixedWidthDecimal, ...(infer Rem2 extends FixedWidthDecimal[])]
            ? VectorPointwiseMultiply<Rem1, Rem2, [...Product, MultiplyFixedWidthDecimal<Field1, Field2>]>
            : never
        : Product;

typeEqual<VectorPointwiseMultiply<[], []>, []>();
typeEqual<VectorPointwiseMultiply<ArrayToVector<[3, -2]>, ArrayToVector<[1, 0]>>, ArrayToVector<[3, 0]>>();
typeEqual<VectorPointwiseMultiply<ArrayToVector<[5, -2]>, ArrayToVector<[-0.5, 1.5]>>, [NumberToFixedWidthDecimal<-2.5>, NumberToFixedWidthDecimal<-3>]>();

type VectorSum<Vec extends Vector, Sum extends FixedWidthDecimal = NumberToFixedWidthDecimal<0>> =
    Vec extends [infer Field extends FixedWidthDecimal, ...infer Rem extends Vector]
        ? VectorSum<Rem, AddFixedWidthDecimal<Field, Sum>>
        : Sum;

typeEqual<VectorSum<[]>, NumberToFixedWidthDecimal<0>>();
typeEqual<VectorSum<ArrayToVector<[3.5, -2.5, 1]>>, NumberToFixedWidthDecimal<2>>();

type InnerProduct<Vec1 extends Vector, Vec2 extends Vector> = VectorSum<VectorPointwiseMultiply<Vec1, Vec2>>;
typeEqual<InnerProduct<ArrayToVector<[3, -2]>, ArrayToVector<[1, 0]>>, NumberToFixedWidthDecimal<3>>();
typeEqual<InnerProduct<ArrayToVector<[3, -2]>, ArrayToVector<[1, -1]>>, NumberToFixedWidthDecimal<5>>();

type NeuronWeights<InputSize extends number> = {
    weight: { length: InputSize } & Vector,
    bias: FixedWidthDecimal
}

type AffineNeuron<Input extends Vector, Weights extends NeuronWeights<number>> =
    AddFixedWidthDecimal<InnerProduct<Weights['weight'], Input>, Weights['bias']>;

type AffineNeuronDerivativeWeight<Input extends Vector> = Input;

type AffineNeuronDerivativeBias = NumberToFixedWidthDecimal<1>;

type AffineNeuronDerivative<Input extends Vector> = {
    weight: AffineNeuronDerivativeWeight<Input>,
    bias: AffineNeuronDerivativeBias
}

type ScalarAffineNeuronMultiply<Scalar extends FixedWidthDecimal, Neuron extends NeuronWeights<number>> = {
    weight: ScalarVectorMultiply<Scalar, Neuron['weight']>,
    bias: MultiplyFixedWidthDecimal<Scalar, Neuron['bias']>
}

type AffineLayer<Input extends Vector, Weights extends NeuronWeights<number>[], Output extends Vector = []> =
    Weights extends [infer W extends NeuronWeights<number>, ...infer Rem extends NeuronWeights<number>[]]
        ? AffineLayer<Input, Rem, [...Output, AffineNeuron<Input, W>]>
        : Output;

type ReLU<Input extends Vector, Result extends Vector = []> =
    Input extends [infer Element extends FixedWidthDecimal, ...infer Rem extends Vector]
        ? GreaterInt8<Element, NumberToFixedWidthDecimal<0>> extends true
            ? ReLU<Rem, [...Result, Element]>
            : ReLU<Rem, [...Result, NumberToFixedWidthDecimal<0>]>
        : Result;

typeEqual<ReLU<ArrayToVector<[1.5, -0.5, 0]>>, ArrayToVector<[1.5, 0, 0]>>();

type ReLuDerivativeScalar<Input extends FixedWidthDecimal> =
    GreaterInt8<Input, NumberToInt8<0>> extends true
        ? NumberToFixedWidthDecimal<1>
        : NumberToFixedWidthDecimal<0>;

type SquaredErrorDerivative<Predicted extends FixedWidthDecimal, Output extends FixedWidthDecimal> =
    MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<-2>, SubtractFixedWidthDecimal<Output, Predicted>>;

type NeuralNetworkWeights<InputSize extends number, HiddenSize extends number> = {
    inputToHidden: NeuronWeights<InputSize>[] & { length: HiddenSize },
    hiddenToOutput: NeuronWeights<HiddenSize>
}

type ForwardPass<Input extends Vector, Weights extends NeuralNetworkWeights<number, number>> =
    AffineNeuron<ReLU<AffineLayer<Input, Weights['inputToHidden']>>, Weights['hiddenToOutput']>

type HiddenLayerDerivativeNeuron<Input extends Vector, ErrorGradient extends FixedWidthDecimal, OutputWeight extends FixedWidthDecimal, NeuronActivation extends FixedWidthDecimal> =
    ScalarAffineNeuronMultiply<MultiplyFixedWidthDecimal<MultiplyFixedWidthDecimal<ErrorGradient, OutputWeight>, ReLuDerivativeScalar<NeuronActivation>>, AffineNeuronDerivative<Input>>;

type InputToHiddenDerivative<Input extends Vector, ErrorGradient extends FixedWidthDecimal, OutputWeights extends NeuronWeights<number>['weight'], HiddenActivation extends Vector, Result extends NeuronWeights<number>[] = []> =
    OutputWeights extends [infer W extends FixedWidthDecimal, ...infer RemWeights extends NeuronWeights<number>['weight']]
        ? HiddenActivation extends [infer H extends FixedWidthDecimal, ...infer RemOutputs extends Vector]
            ? InputToHiddenDerivative<Input, ErrorGradient, RemWeights, RemOutputs, [...Result, HiddenLayerDerivativeNeuron<Input, ErrorGradient, W, H>]>
            : never
        : Result;

type HiddenToOutputDerivative<ErrorGradient extends FixedWidthDecimal, HiddenOutput extends Vector> =
    ScalarAffineNeuronMultiply<ErrorGradient, AffineNeuronDerivative<HiddenOutput>>;

type NeuralNetworkDerivative<Input extends Vector, PredictedOutput extends FixedWidthDecimal, TrueOutput extends FixedWidthDecimal, Weights extends NeuralNetworkWeights<number, number>> =
    SquaredErrorDerivative<PredictedOutput, TrueOutput> extends (infer ErrorGradient extends FixedWidthDecimal)
        ? AffineLayer<Input, Weights['inputToHidden']> extends (infer HiddenActivation extends  Vector)
            ? ReLU<HiddenActivation> extends (infer HiddenOutput extends Vector)
                ? {
                    inputToHidden: InputToHiddenDerivative<Input, ErrorGradient, Weights['hiddenToOutput']['weight'], HiddenActivation>,
                    hiddenToOutput: HiddenToOutputDerivative<ErrorGradient, HiddenOutput>
                }
                : never
            : never
        : never;

type UpdateWeightsNeuron<Weights extends NeuronWeights<number>, Derivative extends NeuronWeights<number>, LearningRate extends FixedWidthDecimal> =
    {
        weight: VectorAdd<Weights['weight'], ScalarVectorMultiply<MultiplyFixedWidthDecimal<NumberToFixedWidthDecimal<-1>, LearningRate>, Derivative['weight']>>,
        bias: SubtractFixedWidthDecimal<Weights['bias'], MultiplyFixedWidthDecimal<LearningRate, Derivative['bias']>>
    }

typeEqual<
    UpdateWeightsNeuron<
        { weight: ArrayToVector<[1, -2.5]>, bias: NumberToFixedWidthDecimal<0.5> },
        { weight: ArrayToVector<[-0.5, 1]>, bias: NumberToFixedWidthDecimal<1> },
        NumberToFixedWidthDecimal<2>
    >,
    { weight: ArrayToVector<[2, -4.5]>, bias: NumberToFixedWidthDecimal<-1.5> }
>();

type UpdateWeightsLayer<Weights extends NeuronWeights<number>[], Derivatives extends NeuronWeights<number>[], LearningRate extends FixedWidthDecimal, Result extends NeuronWeights<number>[] = []> =
    Weights extends [infer W extends NeuronWeights<number>, ...infer RemWeights extends NeuronWeights<number>[]]
        ? Derivatives extends [infer D extends NeuronWeights<number>, ...infer RemDerivatives extends NeuronWeights<number>[]]
            ? UpdateWeightsLayer<RemWeights, RemDerivatives, LearningRate, [...Result, UpdateWeightsNeuron<W, D, LearningRate>]>
            : never
        : Result;

type BackwardPass<Input extends Vector, TrueOutput extends FixedWidthDecimal, Weights extends NeuralNetworkWeights<number, number>, LearningRate extends FixedWidthDecimal> =
    NeuralNetworkDerivative<Input, ForwardPass<Input, Weights>, TrueOutput, Weights> extends {
            inputToHidden: infer InputToHiddenDerivative extends NeuronWeights<number>[],
            hiddenToOutput: infer HiddenToOutputDerivative extends NeuronWeights<number>
        }
        ? {
            inputToHidden: UpdateWeightsLayer<Weights['inputToHidden'], InputToHiddenDerivative, LearningRate>,
            hiddenToOutput: UpdateWeightsNeuron<Weights['hiddenToOutput'], HiddenToOutputDerivative, LearningRate>
        }
        : never;

type ExampleWeights = {
    inputToHidden: [
        { weight: ArrayToVector<[0.5, 1.0]>, bias: NumberToFixedWidthDecimal<1.0> },
        { weight: ArrayToVector<[-1.0, 2.0]>, bias: NumberToFixedWidthDecimal<0> },
        { weight: ArrayToVector<[0.5, 1]>, bias: NumberToFixedWidthDecimal<-0.5> }
    ],
    hiddenToOutput: { weight: ArrayToVector<[-0.5, 1.0, 0.25]>, bias: NumberToFixedWidthDecimal<0.5> }
}

typeEqual<ExampleWeights extends NeuralNetworkWeights<2, 3> ? true : false, true>();
typeEqual<ForwardPass<ArrayToVector<[1, -1]>, ExampleWeights>, NumberToFixedWidthDecimal<0.25>>();

type TrainOnceAndPredict<Input extends Vector, TrueOutput extends FixedWidthDecimal, Weights extends NeuralNetworkWeights<number, number>, LearningRate extends FixedWidthDecimal> =
    BackwardPass<Input, TrueOutput, Weights, LearningRate> extends (infer NewWeights extends NeuralNetworkWeights<number, number>)
        ? ForwardPass<Input, NewWeights>
        : never;

typeEqual<TrainOnceAndPredict<ArrayToVector<[1, -1]>, NumberToFixedWidthDecimal<4>, ExampleWeights, NumberToFixedWidthDecimal<0.5>>, NumberToFixedWidthDecimal<4.25>>();
