import { toJS } from 'mobx'

export function consoLER(...data: any[]) {
  if (__IS_DEV__) {
    console.log(...data)
  }
}

export function cMobx(...data: any[]) {
  if (__IS_DEV__) {
    data.map((d) => console.log(toJS(d)))
  }
}
