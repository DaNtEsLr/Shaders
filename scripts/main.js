
const _dirs = [{
        x: 1,
        y: 0
    },
    {
        x: 0,
        y: 1
    },
    {
        x: -1,
        y: 0
    },
    {
        x: 0,
        y: -1
    }

]
const tilechkdirs = [
	{x:-1,y: 1},{x:0,y: 1},{x:1,y: 1},
	{x:-1,y: 0},/*[tile]*/ {x:1,y: 0},
	{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},
]

var shadowRegion=null;

const tileMap = [//not sure how to format this.
	39,39,27,27,39,39,27,27,38,38,17,26,38,38,17,26,36,
	36,16,16,36,36,24,24,37,37,41,21,37,37,43,25,39,
	39,27,27,39,39,27,27,38,38,17,26,38,38,17,26,36,
	36,16,16,36,36,24,24,37,37,41,21,37,37,43,25,3,
	3,15,15,3,3,15,15,5,5,29,31,5,5,29,31,4,
	4,40,40,4,4,20,20,28,28,10,11,28,28,23,32,3,
	3,15,15,3,3,15,15,2,2,9,14,2,2,9,14,4,
	4,40,40,4,4,20,20,30,30,47,44,30,30,22,6,39,
	39,27,27,39,39,27,27,38,38,17,26,38,38,17,26,36,
	36,16,16,36,36,24,24,37,37,41,21,37,37,43,25,39,
	39,27,27,39,39,27,27,38,38,17,26,38,38,17,26,36,
	36,16,16,36,36,24,24,37,37,41,21,37,37,43,25,3,
	3,15,15,3,3,15,15,5,5,29,31,5,5,29,31,0,
	0,42,42,0,0,12,12,8,8,35,34,8,8,33,7,3,
	3,15,15,3,3,15,15,2,2,9,14,2,2,9,14,0,
	0,42,42,0,0,12,12,1,1,45,18,1,1,19,13
]


function _getRegion(region, tile) {
    if (!region) {
        print("oh no there is no texture");
        return;
    }
    let nregion = new TextureRegion(region);
    let tilew = (nregion.u2 - nregion.u)/12.0;
	let tileh = (nregion.v2 - nregion.v)/4.0;
	let tilex = (tile%12)/12.0;
	let tiley = Math.floor(tile/12)/4.0;
	
	nregion.u = Mathf.map(tilex,0,1,nregion.u,nregion.u2)+tilew*0.02;
	nregion.v = Mathf.map(tiley,0,1,nregion.v,nregion.v2)+tileh*0.02; //y is flipped h 
	nregion.u2 = nregion.u+tilew*0.96;
	nregion.v2 = nregion.v+tileh*0.96;
	nregion.width = 32;
	nregion.height = 32;
    return nregion;
}

function drawConnectedTile(region, x, y, w, h, rot, tile) {
    Draw.rect(_getRegion(region, tile) , x, y, w, h, w * 0.5, h * 0.5, rot);
}


function Cbezierlerp2(x,y,x2,y2,x3,y3,x4,y4,t){
	var te3 = t*t*t;
	var t3 = 3*t;
	var t32 = t3*t;
	var a1 = -te3   +t32 - t3 + 1;
	var a2 = te3*3  -2*t32 + t3;
	var a3 = -te3*3 + t32;
	var a4 = te3;
	var t6 = 6*t;
	var b1 = -t32 + t6 - 3;
	var b2 = t32*3 - t6*2 + 3;
	var b3 = -t32*3 + t6;
	var b4 = t32;
	
	return [a1*x + a2*x2 + a3*x3 + a4*x4, a1*y + a2*y2 + a3*y3 + a4*y4, 
			b1*x + b2*x2 + b3*x3 + b4*x4, b1*y + b2*y2 + b3*y3 + b4*y4];
}

function deepCopy(obj) {
	var clone = {};
	for (var i in obj) {
		if (Array.isArray(obj[i])) {
			clone[i] = [];
			for (var z in obj[i]) {
				if (typeof(obj[i][z]) == "object" && obj[i][z] != null) {
					clone[i][z] = deepCopy(obj[i][z]);
				} else {
					clone[i][z] = obj[i][z];
				}
			}
		} else if (typeof(obj[i]) == "object" && obj[i] != null)
			clone[i] = deepCopy(obj[i]);
		else
			clone[i] = obj[i];
	}
	return clone;
}

function getRegion(region, tile,sheetw,sheeth) {
    if (!region) {
        print("oh no there is no texture");
        return;
    }
    let nregion = new TextureRegion(region);
    let tilew = (nregion.u2 - nregion.u)/sheetw;
	let tileh = (nregion.v2 - nregion.v)/sheeth;
	let tilex = (tile%sheetw)/sheetw;
	let tiley = Math.floor(tile/sheetw)/sheeth;
	
	nregion.u = Mathf.map(tilex,0,1,nregion.u,nregion.u2);
	nregion.v = Mathf.map(tiley,0,1,nregion.v,nregion.v2); 
	nregion.u2 = nregion.u+tilew;
	nregion.v2 = nregion.v+tileh;
	nregion.width = region.width/sheetw;
	nregion.height = region.height/sheeth;
    return nregion;
}

function drawOrientedRect(tex,x,y,ox,oy,rotdeg,rot){
	Draw.rect(tex,x + Mathf.cosDeg(rotdeg-90)*ox + Mathf.sinDeg(rotdeg-90)*oy,y + Mathf.sinDeg(rotdeg-90)*ox - Mathf.cosDeg(rotdeg-90)*oy,rot+rotdeg);
}

function drawOrientedLine(tex,x,y,ox,oy,ox2,oy2,rotdeg){
	let c = Mathf.cosDeg(rotdeg-90);
	let s = Mathf.sinDeg(rotdeg-90);
	Lines.line(tex,   x + c*ox + s*oy,y + s*ox - c*oy,   x + c*ox2 + s*oy2,y + s*ox2 - c*oy2,   false);
}
function createOrientedEffect(eff,x,y,ox,oy,rotdeg,rot){
	eff.at(x + Mathf.cosDeg(rotdeg-90)*ox + Mathf.sinDeg(rotdeg-90)*oy,y + Mathf.sinDeg(rotdeg-90)*ox - Mathf.cosDeg(rotdeg-90)*oy,rot);
}

function drawItemCluster(x,y,item,am,randpos,startp){
	if(am>0){
		am = Math.min(am,100);
		for(var i = 0;i<am;i++){
			Draw.rect(item.fullIcon, x+randpos[(i+startp)%randpos.length].x, y+randpos[(i+startp)%randpos.length].y, 5,5);
		}
	}
}
function drawItemClusterInventory(x,y,item,items,randpos,startp){
	drawItemCluster(x,y,item,items.get(item),randpos,startp);
}
function readString(path){
        return Vars.tree.get(path, true).readString();
 }
function extendShader2(shadername, ext){
	return extendShader(shadername,ext);//extend(Shaders.SurfaceShader, readString("shaders/"+shadername+".frag"),ext);
}

function extendShader(shadername, ext){
	const shad = new Shader(readString("shaders/screenspace.vert"), readString("shaders/"+shadername+".frag"));
	return extend(Shaders.SurfaceShader, "space", Object.assign({
			setVertexAttribute(name, size, type, normalize, stride, buffer) {
				shad.setVertexAttribute(name, size, type, normalize, stride, buffer);
			},
			enableVertexAttribute(location){
				shad.enableVertexAttribute(location);
			},
			disableVertexAttribute(name){
				shad.disableVertexAttribute(name);
				//3553
			},
			fetchUniformLocation(name, pedantic) {
				return shad.fetchUniformLocation(name,pedantic);
			},
			getAttributeLocation(name){
				return shad.getAttributeLocation(name);
			},
			getAttributes(){
				return shad.getAttributes();
			},
			getUniforms(){
				return shad.getUniforms();
			},
			getAttributeSize(name){
				return shad.getAttributeSize(name);
			},
			bind(){
				shad.bind();
			},
			hasUniform(name) {
				return shad.hasUniform(name);
			},
			getUniformType(name) {
				return shad.getUniformType(name);
			},
			getUniformLocation(name) {
				return shad.getUniformLocation(name);
			},
			getUniformSize(name) {
				return shad.getUniformSize(name);
			},
			dispose() {
				shad.dispose();
				this.super$dispose();
			},
			isDisposed() {
				return shad.isDisposed();
			}
		},ext));
}
function addShader(shader, name){
	Shaders[name] = shader;
	let original = CacheLayer[name];
	for(let i = 0;i<CacheLayer.all.length;i++){
		if(CacheLayer.all[i] == original){
			CacheLayer[name] = new CacheLayer.ShaderLayer(shader);
			CacheLayer.all[i] = CacheLayer[name];
			CacheLayer.all[i].id = i;
		}
	}
}

function initShader(){
	Shaders.water = extendShader2("water", {
		apply(){
			flyingbuffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(300.0,60.0));
			this.setUniformf("tscal",1.0);
		}}
	);
	addShader(Shaders.water,"water");
	
	Shaders.tar = extendShader2("tar", {
		apply(){
			flyingbuffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(300.0,200.0));
			this.setUniformf("tscal",0.2);
		}}
	);
	addShader(Shaders.tar,"tar");
	
	Shaders.mud = extendShader2("mud", {
		apply(){
			flyingbuffer.getTexture().bind(2);
			this.super$apply();
			this.setUniformi("u_flying", 2);
			this.setUniformf("mscl",new Vec2(100.0,100.0));
			this.setUniformf("tscal",0.02);
		}}
	);
	addShader(Shaders.mud,"mud");
	
	Shaders.slag = extendShader2("slag", {});
	addShader(Shaders.slag,"slag");
	
}

var fancy = true;

var water;
var slag;
var flyingbuffer;
Events.run(Trigger.draw, () => {
	Draw.draw(Layer.flyingUnitLow-0.01, run(()=>{
		flyingbuffer.resize(Core.graphics.width, Core.graphics.height);
		flyingbuffer.begin(Color.clear);
	}));
	Draw.draw(Layer.flyingUnit+0.01, run(()=>{
		flyingbuffer.end();
		flyingbuffer.blit(Shaders.screenspace);
	}));
});

Events.on(EventType.ClientLoadEvent, 
cons(e => {
	Log.info("Client load")
	Vars.ui.settings.graphics.checkPref("seethrough", Core.settings.getBool("seethrough"));
	Core.settings.defaults("seethrough", true);
	
	flyingbuffer = new FrameBuffer(Core.graphics.width, Core.graphics.height);
	initShader();

	shadowRegion = Core.atlas.find("danteslr-shaders-connected-shadows");
	var shadowRegionNoRivet = Core.atlas.find("danteslr-shaders-connected-shadows-norivet");
	var envrionment = Core.atlas.find("grass1").texture;
	var envpixmap = envrionment.getTextureData().pixmap;
<<<<<<< HEAD
	envrionment.load(envrionment.getTextureData());	
=======
	armbase = Core.atlas.find("xelos-pixel-texturepack-construct-arm-base");
	armhead = Core.atlas.find("xelos-pixel-texturepack-construct-arm-head");
	armheadlarge = Core.atlas.find("xelos-pixel-texturepack-construct-arm-head-large");
	armconn = Core.atlas.find("xelos-pixel-texturepack-construct-arm-connector");
	armconnside = Core.atlas.find("xelos-pixel-texturepack-construct-arm-connector-side");
	armconntickside = Core.atlas.find("xelos-pixel-texturepack-construct-arm-connector-thick-side");
	armconnjoint = Core.atlas.find("xelos-pixel-texturepack-construct-arm-connector-joint");
	expoplatform = Core.atlas.find("xelos-pixel-texturepack-construct-platform");
	weldspark = new Effect(12, cons(e=>{
		Draw.color(Color.white, Pal.turretHeat, e.fin());
        Lines.stroke(e.fout() * 0.6 + 0.6);

        Angles.randLenVectors(e.id, 3, 15 * e.finpow(), e.rotation, 3, new Floatc2(){get: (x, y) => {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fslope() * 5 + 0.5);
        }});
	}));
	weldglow = new Effect(20, cons(e=>{
		Draw.color(Color.white, Pal.turretHeat, e.fin());
        Fill.square(e.x,e.y,e.fout() * 0.6 + 0.6);
	}));
	
	Vars.content.getBy(ContentType.block).each(block=>{
		/*
		if(!(block instanceof BaseTurret) &&
		    !(block instanceof Conveyor) &&
			!(block instanceof PayloadConveyor) &&
			!(block instanceof LiquidBlock) &&
			!(block instanceof UnitFactory) &&
			!(block instanceof Reconstructor) &&
			!(block instanceof RepairTurret) &&
			!(block instanceof MassDriver) &&
			!(block instanceof Floor) &&
			!(block instanceof Drill)){
			changeAtlasToSprite("block",block.name,Core.atlas.find(block.name));
		}*/
		
		if(block instanceof Floor){
			if(block.variants>0){
				if(block.variantRegions){
					for(let i = 0;i<block.variants;i++){
						directAtlasReplace(block.variantRegions[i], Core.atlas.find("xelos-pixel-texturepack-"+block.name+(i+1)));
					}
				}
			}else{
				directAtlasReplace(block.variantRegions[0], Core.atlas.find("xelos-pixel-texturepack-"+block.name));
			}
			directAtlasReplace(Core.atlas.find(block.name+"-edge"), Core.atlas.find("xelos-pixel-texturepack-"+block.name + "-edge"));
		}
		
		if(block instanceof Prop){
			if(block.variants>0){
				if(block.variantRegions){
					for(let i = 0;i<block.variants;i++){
						directAtlasReplace(block.variantRegions[i], Core.atlas.find("xelos-pixel-texturepack-"+block.name+(i+1)));
					}
				}
			}else{
				directAtlasReplace(block.region, Core.atlas.find("xelos-pixel-texturepack-"+block.name));
			}
			if(block instanceof StaticWall){
				directAtlasReplace(block.large, Core.atlas.find("xelos-pixel-texturepack-"+block.name+"-large"));
			}
		}
	});
	envrionment.load(envrionment.getTextureData());
	
	Vars.content.getBy(ContentType.unit).each(unit=>{
		changeAtlasToSprite("unit",unit.name + "-outline",Core.atlas.find("unit-"+unit.name + "-outline"));
		unit.loadIcon();
		changeAtlasToSprite("unit",unit.name,unit.fullIcon);
	});
	
	
	Blocks.itemBridge.buildType = () =>{
		return extend(BufferedItemBridge.BufferedItemBridgeBuild, Blocks.itemBridge,deepCopy(bridgeB));
	}
	Blocks.phaseConveyor.buildType = () =>{
		return extend(ItemBridge.ItemBridgeBuild, Blocks.phaseConveyor,deepCopy(bridgeB));
	}
	
>>>>>>> 5979babd839ebeb7f7072140e8bca23f2d1a8531
})
);

function addConsButton(table, consFunc, style, runnable) {
	let button = new Button(style);
	button.clearChildren();
	button.clicked(runnable);
	consFunc.get(button);
	return table.add(button);
}
