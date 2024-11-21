export function padd(value, nZeros) {
  const valueAsString = '' + value

  if (valueAsString.length < nZeros) {
    let padding = ''

    for (let i = 0; i < nZeros - valueAsString.length; i++) {
      padding += '0'
    }

    return padding + valueAsString
  }

  return valueAsString
}
