export default function unique(list) {
  return list.filter((item, index, all) => all.indexOf(item) === index)
}
