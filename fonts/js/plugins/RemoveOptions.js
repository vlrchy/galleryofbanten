//=============================================================================
// RemoveOptions.js                                                             
//=============================================================================

/*:
*
* @author TheCosmicSlug
* @plugindesc Cleans up the in-game options.
*
* @help
* Version 1.00
//=============================================================================
// Features                                                             
//=============================================================================
* Merges BGM volume & ME volume in the options.
  Merges BGS volume & SE volume in the options.
*/
Window_Options.prototype.addGeneralOptions = function() {

};

Window_Options.prototype.addVolumeOptions = function() {
    this.addCommand(TextManager.bgmVolume, 'bgmVolume', 'meVolume');
    //this.addCommand(TextManager.bgsVolume, 'bgsVolume');
    //this.addCommand(TextManager.meVolume, 'meVolume');
    this.addCommand(TextManager.seVolume, 'seVolume', 'bgsVolume');
};

