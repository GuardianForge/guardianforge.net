const { activityOptions } = require("../constants")

const defaultFiltersMap = {
  "Class": {
    "class-0": {
      id: "class-0",
      friendlyName: "Class",
      displayValue: "Titan",
      fieldName: "class",
      value: 0,
      iconPath: "/img/classicos/0nom.png",
      color: "rgb(188,58,34)"
    },
    "class-1": {
      id: "class-1",
      friendlyName: "Class",
      displayValue: "Hunter",
      fieldName: "class",
      value: 1,
      iconPath: "/img/classicos/1nom.png",
      color: "rgb(105,164,182)"
    },
    "class-2": {
      id: "class-2",
      friendlyName: "Class",
      displayValue: "Warlock",
      fieldName: "class",
      value: 2,
      iconPath: "/img/classicos/2nom.png",
      color: "rgb(234,178,59)"
    }
  },
  "Subclass": {
    "subclass-2": {
      id: "subclass-2",
      friendlyName: "Subclass",
      displayValue: "Arc",
      fieldName: "subclass",
      value: 2,
      iconPath: "/img/elemicos/2w.png",
      color: "#4ebec4"
    },
    "subclass-3": {
      id: "subclass-3",
      friendlyName: "Subclass",
      displayValue: "Solar",
      fieldName: "subclass",
      value: 3,
      iconPath: "/img/elemicos/3w.png",
      color: "#F0631E"
    },
    "subclass-4": {
      id: "subclass-4",
      friendlyName: "Subclass",
      displayValue: "Void",
      fieldName: "subclass",
      value: 4,
      iconPath: "/img/elemicos/4w.png",
      color: "#B185DF"
    },
    "subclass-6": {
      id: "subclass-6",
      friendlyName: "Subclass",
      displayValue: "Stasis",
      fieldName: "subclass",
      value: 6,
      iconPath: "/img/elemicos/6w.png",
      color: "#4D88FF"
    }
  }
}

exports.buildAvailableFilters = function () {
  let filters = {}
  Object.keys(defaultFiltersMap).forEach(k => {
    filters[k] = defaultFiltersMap[k]
  })

  filters["Activity"] = {}
  activityOptions.forEach(el => {
    // Skip "Any Activity"
    if(el.value === "1") {
      return
    }

    filters["Activity"][`activity-${el.value}`] = {
      id: `activity-${el.value}`,
      friendlyName: "Activity",
      displayValue: el.display,
      fieldName: "primaryActivity",
      value: el.value,
      iconPath: el.iconUrl,
      color: "#555"
    }
  })
  return filters
}

exports.buildAlgoliaFilters = function(inFilters) {
  let filterMap = {}
  // @ts-ignore TODO: fix me
  inFilters.forEach(el => {
    // @ts-ignore TODO: fix me
    if(filterMap[el.fieldName]) {
      // @ts-ignore TODO: fix me
      filterMap[el.fieldName].values.push(el.value)
    } else {
      // @ts-ignore TODO: fix me
      filterMap[el.fieldName] = {
        values: [
          el.value
        ]
      }
    }
  })

  let filterString = ""
  Object.keys(filterMap).forEach(key => {
    if (filterString !== "") {
      filterString += " AND "
    }
    // @ts-ignore TODO: fix me
    filterString += "("
    // @ts-ignore TODO: fix me
    filterMap[key].values.forEach((value, idx) => {
      if(typeof(value) === "number") {
        filterString += `${key} = ${value}`
      }
      if(typeof(value) === "string") {
        filterString += `${key}:${value}`
      }
      // @ts-ignore TODO: fix me
      if (idx < filterMap[key].values.length - 1) {
        filterString += " OR "
      }
    })
    filterString += ")"
  })
  return filterString
}