//============================================================================
// Eli_NameBox.js
//============================================================================

/*:
@plugindesc ♦5.1.0♦ Add a name box window for the message window.
@author Hakuen Studio

@help 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
If you like my work, please consider supporting me on Patreon!
Patreon      → https://www.patreon.com/hakuenstudio
Terms of Use → https://www.hakuenstudio.com/terms-of-use-5-0-0
Facebook     → https://www.facebook.com/hakuenstudio
Instagram    → https://www.instagram.com/hakuenstudio
Twitter      → https://twitter.com/hakuen_studio
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
============================================================================
Plugin Requirements
============================================================================

Order Before Eli_FaceWindow

==============================================================================
Features
==============================================================================

● Add a Name Box window to show on the message!
● Set the names via plugin command or escape code!
● Change name box position via aligment and offset X, Y values!

==============================================================================
How to use
==============================================================================

♦ Plugin Command ♦

You can set a speaker name into the message using a plugin command:

• SpeakerName The name you want

Example:

• SpeakerName Harold

♦ Escape Code ♦

On the first line, at the beginning of the text, use the tag:

• Name<Speaker name here>

Example:

•Name<Patricia>

*Plugin command and escape code are not case sensitive.

To change the alignment of the name window box inside the game, use the 
following script call:

Eli.NameBox.param().alignment = "Left" | "Center" | "Right"

Use one of the three options. It is case-sensitive and needs to be 
inside quotes.

============================================================================
Update Log
============================================================================

https://tinyurl.com/nameBoxLog

============================================================================

@param alignment
@text Alignment
@type select
@option Left
@option Center
@option Right
@desc Choose the X position of the name box according to the alignment.
@default Left

@param offset
@text Offset X Y
@type text
@desc The offset values for X and Y. Separate each one with a comma.
@default 0, 0


*/

"use strict"

var Eli = Eli || {}
var Imported = Imported || {}
Imported.Eli_NameBox = true

/* ========================================================================== */
/*                                   PLUGIN                                   */
/* ========================================================================== */
{

class Window_NameBox extends Window_Base {

    constructor(messageWindow){
        super(messageWindow)
    }
    
    initialize(messageWindow){
        this.rtlReg = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
        this._messageWindow = messageWindow
        const width = this.windowWidth()
        const height = this.windowHeight()
        Window_Base.prototype.initialize.call(this, 0, 0, width, height)
        this.openness = 0
        this._name = ""
    }

    windowWidth(){
        if (this._name){
            this.contents = new Bitmap(1000, 1000)
            const textWidth = Eli.Utils.getTextWidth(this._name)
            const padding = this.standardPadding() + this.textPadding()
            const width = Math.ceil(textWidth) + padding * 2
            return Math.min(width, Graphics.boxWidth)
        }else{
            return 0
        }
    }

    windowHeight(){
        return this.fittingHeight(1)
    }
    
    setName(name){
        if (this._name !== name) {
            this._name = name
            this.refresh()
        }
    }
    
    clear(){
        this.setName("")
    }
    
    start(){
        this.updateSize()
        this.updatePlacement()
        this.updateBackground()
        this.createContents()
        this.refresh()
    }

    containsArabic(str) {
        const regExp = this.rtlReg
        return regExp.test(str)
    }

    isRTL(){
        return this.containsArabic($gameMessage.allText())
    }

    updateSize(){
        this.width = this.windowWidth()
        this.height = this.windowHeight()
    }
    
    updatePlacement(){
        const msgWin = this._messageWindow

        if(Plugin.param().alignment === "Left"){
            this.x = msgWin.x
        }else if(Plugin.param().alignment === "Center"){
            this.x = Math.floor(msgWin.x + (msgWin.width - this.width)/2)
        }else{
            this.x = Math.floor((msgWin.x + msgWin.width) - this.width)
        }

        this.x += Plugin.param().offset[0] || 0

        if($gameMessage.positionType() === 0){
            this.y = msgWin.y + msgWin.height
            this.y += Math.abs(Plugin.param().offset[1] || 0)
        }else{
            this.y = msgWin.y - this.height
            this.y += Plugin.param().offset[1]
        }
    }
    
    updateBackground(){
        this.setBackgroundType($gameMessage.background())
    }

    baseTextRect() {
        const rect = new Rectangle(0, 0, this.innerWidth, this.innerHeight)
        rect.pad(-this.textPadding(), 0)

        return rect
    }
    
    refresh() {
        const rect = this.baseTextRect()
        this.contents.clear()
        this.drawTextEx(this._name, rect.x, rect.y, rect.width)
    }

    update(){
        super.update()
        this.openness = Eli.Utils.scene()._messageWindow.openness
    }

}

Eli.NameBox = {

    version: 5.10,
    url: "https://hakuenstudio.itch.io/eli-name-box-for-rpg-maker-mv",
    parameters: {
        alignment: "Left",
        offset: [0, 0]
    },
    alias: {},
    nameCache: {},
    Window_NameBox: Window_NameBox,

    initialize(){
        this.initParameters()
    },

    initParameters(){
        const rawParameters = PluginManager.parameters("Eli_NameBox")
        this.parameters = rawParameters
        this.parameters.offset = rawParameters.offset.split(",").map(item => Number(item))
    },

    param(){
        return this.parameters
    },

    executePluginCommandMV(command, args){
        if(command.toUpperCase() === "SPEAKERNAME"){
            const name = args.join(" ")
            $gameMessage.setSpeakerName(name)
        }
    },

    hasNameOnCache(key){
        return this.nameCache[key]
    },

}

const Plugin = Eli.NameBox
const Alias = Eli.NameBox.alias

Plugin.initialize()

/* ------------------------------ GAME MESSAGE ------------------------------ */
{

Alias.Game_Message_clear = Game_Message.prototype.clear
Game_Message.prototype.clear = function() {
    Alias.Game_Message_clear.call(this)
    this._speakerName = ""
}

Game_Message.prototype.speakerName = function() {
    return this._speakerName
}

Game_Message.prototype.setSpeakerName = function(speakerName) {
    this._speakerName = speakerName || ""
}

}

/* ---------------------------- GAME INTERPRETER ---------------------------- */
{

Alias.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand
Game_Interpreter.prototype.pluginCommand = function (command, args) {
Alias.Game_Interpreter_pluginCommand.call(this, command, args)
    Plugin.executePluginCommandMV(command, args)
}

Alias.Game_Interpreter_command101 = Game_Interpreter.prototype.command101
Game_Interpreter.prototype.command101 = function(){
    if(!$gameMessage.isBusy() && !$gameMessage.speakerName()){
        this.setSpeakerName()
    }
    
    return Alias.Game_Interpreter_command101.call(this)
}

Game_Interpreter.prototype.setSpeakerName = function(){
    const nextCommand = this._list[this._index + 1]
    const firstLine = nextCommand.parameters[0]

    if(this._eventId > 0){
        const event = $gameMap.event(this._eventId)
        var key = `${this._mapId}${this._eventId}${event._pageIndex}${this._index}`
    }else{
        var key = `CE${this._mapId}${this._commonEventId}${this._index}`
    }
    
    if(Plugin.hasNameOnCache(key)){
        $gameMessage.setSpeakerName(Plugin.nameCache[key])

    }else if(firstLine.toLowerCase().startsWith("name<")){
        const start = "name<".length
        const end = firstLine.indexOf(">")
        const name = firstLine.substring(start, end)
        
        Plugin.nameCache[key] = name
        nextCommand.parameters[0] = nextCommand.parameters[0].substring(end+1)
        $gameMessage.setSpeakerName(name)

    }
}

}

/* ----------------------------- WINDOW MESSAGE ----------------------------- */
{

Alias.Window_Message_subWindows = Window_Message.prototype.subWindows
Window_Message.prototype.subWindows = function() {
    const subWindows = Alias.Window_Message_subWindows.call(this)
    subWindows.push(this._nameBoxWindow)
    return subWindows
}

Alias.Window_Message_createSubWindows = Window_Message.prototype.createSubWindows
Window_Message.prototype.createSubWindows = function() {
    Alias.Window_Message_createSubWindows.call(this)
    this._nameBoxWindow = new Window_NameBox(this)
}

Alias.Window_Message_startMessage = Window_Message.prototype.startMessage
Window_Message.prototype.startMessage = function() {
    Alias.Window_Message_startMessage.call(this)
    this._nameBoxWindow.start() // Update placement here or in the update placement
}

Alias.Window_Message_newPage = Window_Message.prototype.newPage
Window_Message.prototype.newPage = function(textState) {
    Alias.Window_Message_newPage.call(this, textState)
    this.updateSpeakerName()
}

Window_Message.prototype.updateSpeakerName = function() {
    this._nameBoxWindow.setName($gameMessage.speakerName())
}

}


}