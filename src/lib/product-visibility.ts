/** Pure continuous-visibility state; browser scheduling is deliberately separate. */
export class VisibilityWindow{
  private since:number|undefined;
  private recorded=false;
  update(ratio:number,visible:boolean,now:number){
    if(!visible||ratio<0.5)this.since=undefined;
    else if(this.since===undefined)this.since=now;
  }
  take(now:number){
    if(this.recorded||this.since===undefined||now-this.since<1000)return false;
    this.recorded=true;return true;
  }
}
