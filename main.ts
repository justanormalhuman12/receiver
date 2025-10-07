radio.setGroup(7)

const RADIO_GROUP = 7
const TIMEOUT_MS = 500
const MAX_SPEED = 255
const LOOP_MS = 25

let lastPacketTime = input.runningTime()
let targetLeft = 0
let targetRight = 0

const INVERT_LEFT = false
const INVERT_RIGHT = false

radio.setGroup(RADIO_GROUP)

function clamp(v: number, lo: number, hi: number): number {
    if (v < lo) return lo
    if (v > hi) return hi
    return v
}

radio.onReceivedString(function (receivedString: string) {
    lastPacketTime = input.runningTime()
    let parts = receivedString.split(",")
    if (parts.length < 3) return

    let leftVal = parseInt(parts[1])
    let rightVal = parseInt(parts[2])
    if (isNaN(leftVal) || isNaN(rightVal)) return

    targetLeft = clamp(leftVal, -MAX_SPEED, MAX_SPEED)
    targetRight = clamp(rightVal, -MAX_SPEED, MAX_SPEED)
})

basic.forever(function () {
    let now = input.runningTime()
    if (now - lastPacketTime > TIMEOUT_MS) {
        targetLeft = 0
        targetRight = 0
        rekabit.brakeMotor(MotorChannel.All)
        basic.pause(20)
        return
    }

    let outLeft = INVERT_LEFT ? -targetLeft : targetLeft
    let outRight = INVERT_RIGHT ? -targetRight : targetRight

    if (outLeft > 0) rekabit.runMotor(MotorChannel.M1, MotorDirection.Forward, outLeft)
    else if (outLeft < 0) rekabit.runMotor(MotorChannel.M1, MotorDirection.Backward, -outLeft)
    else rekabit.brakeMotor(MotorChannel.M1)

    if (outRight > 0) rekabit.runMotor(MotorChannel.M2, MotorDirection.Forward, outRight)
    else if (outRight < 0) rekabit.runMotor(MotorChannel.M2, MotorDirection.Backward, -outRight)
    else rekabit.brakeMotor(MotorChannel.M2)

    basic.pause(LOOP_MS)
})
