import {MapObject} from "./interactives";

interface IPathPoint {
  x: number,
  y: number,
  step?: number,
  parentCoords?: { x: number, y: number },
  index?: number,
  parentIndex?: number,
  status?: string
}
//при удалении игрока при разрушении здания
//при появлении вражеского игрока- обновлять данные о препятствиях
export class TraceMap {
  private matrixMap: Map<string, number>;
  private activeUnits: any[];
  private finishTileCoordinates: Record<string, number>;
  private path: IPathPoint[];
//TODO когда статус поменяется на mode 0, обнулить данные класса и изменить положение человечка там где они объявляются
  constructor() {
    this.matrixMap
    this.activeUnits = []
    this.finishTileCoordinates
    this.path
  }

  setMapData(map: Map<string, number>) {
    this.matrixMap = map
  }

  addObjectData(object: MapObject){
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const getMapValue = this.matrixMap.get(`${object.position.y + i}-${object.position.x + j}`)
        const newValue = getMapValue + object.tiles[i][j];
        this.matrixMap.set(`${object.position.y + i}-${object.position.x + j}`, newValue === 1 ? 1 : newValue + 4)
      }
    }
  }

  activeUnitCoordinates(coordinates: Record<string, number>) {
    console.log(this.activeUnits,'&&')
    this.activeUnits.push(coordinates)
  }

//finish index=50
  setPathFinishPoint(coordinates: Record<string, number>) {
    this.finishTileCoordinates = coordinates
    this.matrixMap.set(`${coordinates.y}-${coordinates.x}`, 50);
    this.path = this.buildPath()
    this.matrixMap.set(`${coordinates.y}-${coordinates.x}`, 1);
  }

  buildPath() {
    const matrixCopy=new Map(this.matrixMap)
    const steps = [
      {x: -1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}, {
        x: 0,
        y: 1
      }, {x: 0, y: -1}
    ]
    const pathForOne = (startPointIndex: number) => {
      let isFinished = false
      const pathSteps: IPathPoint[] = []

      const makeStep = (data: IPathPoint) => {
        let currentStep = 1
        let arrIndex = 0

        pathSteps.push({x: data.x, y: data.y, index: arrIndex})
        arrIndex++
        const check = (coords: IPathPoint) => {
          steps.forEach(st => {
            let newX = st.x + coords.x
            let newY = st.y + coords.y
            if (newX >= 0 && newY >= 0 && matrixCopy.has(`${newY}-${newX}`)) {
              if (matrixCopy.get(`${newY}-${newX}`) == 1) {

                if (currentStep === coords.step) currentStep++
                matrixCopy.set(`${newY}-${newX}`, currentStep+1)
                pathSteps.push({
                  x: newX, y: newY, step: currentStep,
                  parentCoords: {x: coords.x, y: coords.y}, index: arrIndex, parentIndex: coords.index
                })
                arrIndex++
              }
              else if (matrixCopy.get(`${newY}-${newX}`) == 50) {
                isFinished = true
                pathSteps.push({
                  x: newX, y: newY, step: currentStep, parentIndex: coords.index,
                  index: arrIndex, parentCoords: {x: coords.x, y: coords.y}, status: 'finish'
                })
                console.log("Finish")
                arrIndex++
              }
            }
          })
        }
        console.log("DATA", data)
        check(data)
        let ind = 0
        do {
          check(pathSteps[ind])
          ind++
        } while (!isFinished)
      }
      makeStep(this.activeUnits[0])
      console.log('###', pathSteps)

      function getPath() {
        const path = []
        const rec = (el: IPathPoint) => {
          if (!el) {
            return
          }
          path.push({x: el.x, y: el.y})
          el.parentCoords && rec(pathSteps[el.parentIndex])
        }
        const finishStep = pathSteps.find(el => el.status === 'finish')
        path.push({x: finishStep.x, y: finishStep.y})
        rec(finishStep)
        path.push({x: pathSteps[0].x, y: pathSteps[0].y})
        return path.reverse()
      }

      const pathArray = getPath()
      console.log(pathArray)
      // pathArray.forEach((p, i) => {
      //   (i > 0 && i < pathArray.length - 2)
      //   && (cellElements.get(`${p.y}-${p.x}`).style.background = 'yellow')
      //
      // })
      return pathArray
    }
    return pathForOne(0)
  }

  getPath() {
    return this.path
  }

}