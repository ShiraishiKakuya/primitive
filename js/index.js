var setup = {
	canvas : document.getElementById("canvas"),
	ctx : document.getElementById("canvas").getContext("2d"),
	width : new Number(),
	height : new Number(),
	init : function() {
		setup.ctx = setup.canvas.getContext("2d");
        setup.canvas.width = window.innerWidth;
        setup.canvas.height = window.innerHeight;
		setup.width = setup.canvas.width;
		setup.height = setup.canvas.height;
	}
};
setup.init();


var dtr = function(d) {return d*Math.PI/180};
var ceiling = function(num) {return parseInt(num*10000)/10000};

var polarToRectangle =  function(dX, dY, radius) {
	var x = Math.sinE0(dtr(dX)) * Math.cosE0(dtr(dY)) * radius;
	var y = Math.sinE0(dtr(dX)) * Math.sinE0(dtr(dY)) * radius;
	var z = Math.cosE0(dtr(dX)) * radius;
	return {x:y, y:z, z:x};
};
//rectangleToPolar
var rectangleToPolar = function(x, y, z) {
	if(x == 0)	var xD = 0.001;
	else		var xD = x;
	if(y == 0)	var yD = 0.001;
	else		var yD = y;
	if(z == 0)	var zD = 0.001;
	else		var zD = z;
	var radius = Math.sqrt(xD*xD + yD*yD + zD*zD);
	var theta = Math.atan(zD / Math.sqrt(xD*xD + yD*yD));
	var phi = Math.atan(yD / xD);
	return {x:theta*(180/Math.PI), y:phi*(180/Math.PI), r:radius};
};


var closeValue = function(minTime, maxTime) {
	this.flag = 0;
	
	this.progress = 0;
	this.startTime = 0;
	this.durationTime = 0;
	
	this.fromValue = 0;
	this.toValue = 0;
	
	this.minValue = 0;
	this.maxValue = 1;
	this.minDuration = minTime;
	this.maxDuration = maxTime;
};
closeValue.prototype = {
	init : function() {
		this.durationTime = this.minDuration + (this.maxDuration-this.minDuration) * Math.random();
		this.startTime = Date.now();
		this.progress = Math.min(1, ((Date.now()-this.startTime)/this.durationTime))
		this.fromValue = this.toValue;
		this.toValue = this.minValue + this.maxValue * Math.random();
		this.flag = 1;
		return this.fromValue + (this.toValue - this.fromValue) * this.progress;
	},
	update : function() {
		this.progress = Math.min(1, ((Date.now()-this.startTime)/this.durationTime));
		if(this.progress== 1) this.flag = 0;
		return this.fromValue + (this.toValue - this.fromValue) * this.progress;
	},
	execution : function() {
		if(this.flag == 0)		{return this.init()}
		else if(this.flag == 1)	{return this.update()};
	}
};
var camera = {
	self : {
		x : 0,
		y : 0,
		z : 500
	},
	target : {
		x : 0,
		y : 0,
		z : 0
	},
	distance : {
		x : 0,
		y : 0,
		z : 0
	},
	angle : {
		cosPhi : 0,
		sinPhi : 0,
		cosTheta : 0,
		sinTheta : 0
	},
	zoom : 1,
	display : {
		x : setup.width/2,
		y : setup.height/2,
		z : 0
	},
	update : function() {
		camera.distance.x = camera.target.x - camera.self.x;
		camera.distance.y = camera.target.y - camera.self.y;
		camera.distance.z = camera.target.z - camera.self.z;
		camera.angle.cosPhi = -camera.distance.z / Math.sqrt(camera.distance.x*camera.distance.x + camera.distance.z*camera.distance.z);
		camera.angle.sinPhi = camera.distance.x / Math.sqrt(camera.distance.x*camera.distance.x + camera.distance.z*camera.distance.z);
		camera.angle.cosTheta = Math.sqrt(camera.distance.x*camera.distance.x + camera.distance.z*camera.distance.z) / Math.sqrt(camera.distance.x*camera.distance.x + camera.distance.y*camera.distance.y + camera.distance.z*camera.distance.z);
		camera.angle.sinTheta = -camera.distance.y / Math.sqrt(camera.distance.x*camera.distance.x + camera.distance.y*camera.distance.y + camera.distance.z*camera.distance.z);
	}
};


var light = {
	enableLight : true,
	ambientLight : {
		color : {
			r : 1.0,
			g : 1.0,
			b : 1.0
		},
	},
	directionalLight : {
		degree : {
			x : 0,
			y : 0,
			z : 1
		},
		color : {
			r : 1.0,
			g : 1.0,
			b : 1.0
		},
		intensity : 1.0
	}
};



Math.sinE0 = function(val) {
	if(val === 0) {
		return Math.sin(0.000001)
	} else {
		return Math.sin(val);
	};
};
Math.cosE0 = function(val) {
	if(val === 0) {
		return Math.cos(0.000001)
	} else {
		return Math.cos(val);
	};
};
Math.getVector = function(startVertex, endVertex) {
	return {
		x : endVertex.affineOut.x - startVertex.affineOut.x,
		y : endVertex.affineOut.y - startVertex.affineOut.y,
		z : endVertex.affineOut.z - startVertex.affineOut.z
	};
};
Math.getCross = function(vector1, vector2) {
	return {
		x : vector1.y*vector2.z - vector1.z*vector2.y,
		y : vector1.z*vector2.x - vector1.x*vector2.z,
		z : vector1.x*vector2.y - vector1.y*vector2.x
	};
};
Math.getNormal = function(cross3d) {
	var length = Math.sqrt(cross3d.x*cross3d.x + cross3d.y*cross3d.y + cross3d.z*cross3d.z);
	return {
		x : cross3d.x / length,
		y : cross3d.y / length,
		z : cross3d.z / length
	};
};
var getNormal = function(vectorSet0, vectorSet1) {
	var vector1 = Math.getVector(vectorSet0[0],vectorSet0[1]);
	var vector2 = Math.getVector(vectorSet1[0],vectorSet1[1]);
	var cross = Math.getCross(vector1, vector2);
	var normal = Math.getNormal(cross);
	return normal;
};

Math.getDot = function(vector1, vector2) {
	return vector1.x*vector2.x + vector1.y*vector2.y + vector1.z*vector2.z;
};


var affine = {
	world : {
		size : function(p, size) {
			return {
				x :	p.x * size.x,
				y : p.y * size.y,
				z : p.z * size.z
			}
		},
		rotate: {
			x : function(p, rotate) {
				return {
					x : p.x,
					y : p.y*Math.cosE0(dtr(rotate.x)) - p.z*Math.sinE0(dtr(rotate.x)),
					z : p.y*Math.sinE0(dtr(rotate.x)) + p.z*Math.cosE0(dtr(rotate.x))
				}
			},
			y : function(p, rotate) {
				return {
					x : p.x*Math.cosE0(dtr(rotate.y)) + p.z*Math.sinE0(dtr(rotate.y)),
					y : p.y,
					z : -p.x*Math.sinE0(dtr(rotate.y)) + p.z*Math.cosE0(dtr(rotate.y))
				}
			},
			z : function(p, rotate) {
				return {
					x : p.x*Math.cosE0(dtr(rotate.z)) - p.y*Math.sinE0(dtr(rotate.z)),
					y : p.x*Math.sinE0(dtr(rotate.z)) + p.y*Math.cosE0(dtr(rotate.z)),
					z : p.z
				}
			}
		},
		position : function(p, position) {
			return {
				x : p.x + position.x,
				y : p.y + position.y,
				z : p.z + position.z
			}
		},
	},
	view : {
		phi : function(p) {
			return {
				x : p.x*camera.angle.cosPhi + p.z*camera.angle.sinPhi,
				y : p.y,
				z : p.x*-camera.angle.sinPhi + p.z*camera.angle.cosPhi
			}
		},
		theta : function(p) {
			return {
				x : p.x, 
				y : p.y*camera.angle.cosTheta - p.z*camera.angle.sinTheta,
				z : p.y*camera.angle.sinTheta + p.z*camera.angle.cosTheta
			}
		},
		viewReset : function(p) {
			return {
				x : p.x - camera.self.x,
				y : p.y - camera.self.y,
				z : p.z - camera.self.z
			}
		}
	},
	perspective : function(p) {
		return {
			x : p.x * camera.distance.z/p.z * camera.zoom,
			y : p.y * camera.distance.z/p.z * camera.zoom,
			z : p.z * camera.zoom,
			p : camera.distance.z/p.z
		}
	},
	display : function(p, display) {
		return {
			x : p.x + display.x,
			y : -p.y + display.y,
			z : p.z + display.z,
			p : p.p,
		}
	},
	process : function(model, size, rotate, position,display) {
		var ret = affine.world.size(model, size);
		ret = affine.world.rotate.x(ret, rotate);
		ret = affine.world.rotate.y(ret, rotate);
		ret = affine.world.rotate.z(ret, rotate);
		ret = affine.world.position(ret, position);
		ret = affine.view.phi(ret);
		ret = affine.view.theta(ret);
		ret = affine.view.viewReset(ret);
		ret = affine.perspective(ret);
		ret = affine.display(ret, display);
		return ret;
	}
};


var vertex3d = function(param) {
	this.affineIn = new Object;
	this.affineOut = new Object;
	if(param.vertex != undefined) {
		this.affineIn.vertex = param.vertex;
	} else {
		this.affineIn.vertex = {x:0,y:0,z:0};
	};
	if(param.size != undefined) {
		this.affineIn.size = param.size;
	} else {
		this.affineIn.size = {x:1,y:1,z:1};
	};
	if(param.rotate != undefined) {
		this.affineIn.rotate = param.rotate;
	} else {
		this.affineIn.rotate = {x:0,y:0,z:0,};
	};
	if(param.position != undefined) {
		this.affineIn.position = param.position;
	} else {
		this.affineIn.position = {x:0,y:0,z:0};
	};
};
vertex3d.prototype = {
	vertexUpdate : function() {
		this.affineOut = affine.process(
			this.affineIn.vertex,
			this.affineIn.size,
			this.affineIn.rotate,
			this.affineIn.position,
			camera.display
		);
	}
};


var getFace = function(verts) {
	var cog = {
		x : (verts[0].affineOut.x+verts[1].affineOut.x+verts[2].affineOut.x-camera.display.x*3)/3,
		y : (verts[0].affineOut.y+verts[1].affineOut.y+verts[2].affineOut.y-camera.display.y*3)/3,
		z : (verts[0].affineOut.z+verts[1].affineOut.z+verts[2].affineOut.z-30000)/3
	};
	return {
		verts : verts,
		normal : getNormal([verts[1],verts[0]], [verts[2],verts[0]]),
		distance : Math.floor(Math.pow(cog.x-camera.self.x, 2) + Math.pow(cog.y-camera.self.y, 2) + Math.pow(cog.z-camera.self.z, 2))
	};
};


var texture = {
	image : new Image(),
	vertexPoint : new Object(),
	uvPoint : new Object(),
	vertexVector : new Array(),
	uvVector : new Array(),
	uvVectorInvert : new Object(),
	returnData : new Object(),
	init : function() {
		texture.image = new Image();
		texture.vertexPoint = new Object();
		texture.uvPoint = new Object();
		texture.vertexVector = new Array();
		texture.uvVector = new Array();
		texture.uvVectorInvert = new Object();
		texture.returnData = new Object();
	},
	matrix22Invert : function(argument) {
		this.m11 = 1;
		this.m12 = 0;
		this.m21 = 0;
		this.m22 = 1;
		if(argument.m11 != undefined) this.m11 = argument.m11;
		if(argument.m12 != undefined) this.m12 = argument.m12;
		if(argument.m21 != undefined) this.m21 = argument.m21;
		if(argument.m22 != undefined) this.m22 = argument.m22;
		this.det = this.m11*this.m22 - this.m12*this.m21;
		return {
			m11 : this.m22/this.det,
			m12 : -this.m12/this.det,
			m21 : -this.m21/this.det,
			m22 : this.m11/this.det
		};
	},
	generateTransformData : function(argument) {
		texture.init();
		texture.image = argument.image;
		texture.vertexPoint = argument.vertexPoint;
		texture.uvPoint = argument.uvPoint;
		texture.vertexVector = [
			{
				x : texture.vertexPoint[1].x - texture.vertexPoint[0].x,
				y : texture.vertexPoint[1].y - texture.vertexPoint[0].y 
			},
			{
				x : texture.vertexPoint[2].x - texture.vertexPoint[0].x,
				y : texture.vertexPoint[2].y - texture.vertexPoint[0].y 
			}
		];
		
		texture.uvVector = [
			{
				x : (texture.uvPoint[1].x - texture.uvPoint[0].x) * texture.image.width,
				y : (texture.uvPoint[1].y - texture.uvPoint[0].y) * texture.image.height
			},
			{
				x : (texture.uvPoint[2].x - texture.uvPoint[0].x) * texture.image.width,
				y : (texture.uvPoint[2].y - texture.uvPoint[0].y) * texture.image.height
			}
		];
		texture.uvVectorInvert = texture.matrix22Invert({
			m11:texture.uvVector[0].x,
			m12:texture.uvVector[0].y,
			m21:texture.uvVector[1].x,
			m22:texture.uvVector[1].y
		});
		
		texture.returnData.image = texture.image;
		texture.returnData.a = texture.uvVectorInvert.m11*texture.vertexVector[0].x + texture.uvVectorInvert.m12*texture.vertexVector[1].x;
		texture.returnData.c = texture.uvVectorInvert.m21*texture.vertexVector[0].x + texture.uvVectorInvert.m22*texture.vertexVector[1].x;
		texture.returnData.b = texture.uvVectorInvert.m11*texture.vertexVector[0].y + texture.uvVectorInvert.m12*texture.vertexVector[1].y;
		texture.returnData.d = texture.uvVectorInvert.m21*texture.vertexVector[0].y + texture.uvVectorInvert.m22*texture.vertexVector[1].y;
		texture.returnData.x = texture.vertexPoint[0].x - (texture.returnData.a*texture.uvPoint[0].x*texture.image.width + texture.returnData.c*texture.uvPoint[0].y*texture.image.height),
		texture.returnData.y = texture.vertexPoint[0].y - (texture.returnData.b*texture.uvPoint[0].x*texture.image.width + texture.returnData.d*texture.uvPoint[0].y*texture.image.height)
		
		return texture.returnData;
	}
};


var shader = {
	shadeObject : new Array(),
	zSort : function() {
		shader.shadeObject.sort(
			function(a, b) {
				if (a.face.distance < b.face.distance) return 1;
				if (a.face.distance > b.face.distance) return -1;
				return 0;
			}
		);
	},
	flatShader : {
		directionalLighting : function() {
			if(light.enableLight == true) {
				for(var i=0; i<shader.shadeObject.length; i++) {
					var lambertReflectance = Math.getDot(
						{
							x : ceiling(shader.shadeObject[i].face.normal.x),
							y : ceiling(shader.shadeObject[i].face.normal.y),
							z : ceiling(shader.shadeObject[i].face.normal.z)
						},
						{
							x : light.directionalLight.degree.x,
							y : light.directionalLight.degree.y,
							z : light.directionalLight.degree.z
						}
					);
					if(shader.shadeObject[i].fillFlag === true) {
						shader.shadeObject[i].fillColor = {
							r : (light.directionalLight.color.r*(lambertReflectance-0.5) + shader.shadeObject[i].fillColor.r),
							g : (light.directionalLight.color.g*(lambertReflectance-0.5) + shader.shadeObject[i].fillColor.g),
							b : (light.directionalLight.color.b*(lambertReflectance-0.5) + shader.shadeObject[i].fillColor.b),
							a : shader.shadeObject[i].fillColor.a
						};
					};
					if(shader.shadeObject[i].strokeFlag === true) {
						shader.shadeObject[i].strokeColor = {
							r : (light.directionalLight.color.r*(lambertReflectance-0.5) + shader.shadeObject[i].strokeColor.r),
							g : (light.directionalLight.color.g*(lambertReflectance-0.5) + shader.shadeObject[i].strokeColor.g),
							b : (light.directionalLight.color.b*(lambertReflectance-0.5) + shader.shadeObject[i].strokeColor.b),
							a : shader.shadeObject[i].strokeColor.a
						};
					};
				};
			};
		}
	},
	shade : function() {
		for(var i=0; i<shader.shadeObject.length; i++) {
			if(shader.shadeObject[i].face.normal.z>0) {//culling
				setup.ctx.beginPath();
				for(var j=0; j<shader.shadeObject[i].face.verts.length; j++) {
					if(j == 0) {
						setup.ctx.moveTo(shader.shadeObject[i].face.verts[j].affineOut.x, shader.shadeObject[i].face.verts[j].affineOut.y);
					} else {
						setup.ctx.lineTo(shader.shadeObject[i].face.verts[j].affineOut.x, shader.shadeObject[i].face.verts[j].affineOut.y);
					};
				};
				setup.ctx.closePath();
				if(shader.shadeObject[i].fillFlag === true) {
					if(shader.shadeObject[i].texture != null) {
						setup.ctx.save();
						setup.ctx.clip();
						setup.ctx.setTransform(
							shader.shadeObject[i].texture.a,
							shader.shadeObject[i].texture.b,
							shader.shadeObject[i].texture.c,
							shader.shadeObject[i].texture.d,
							shader.shadeObject[i].texture.x,
							shader.shadeObject[i].texture.y
						);
						setup.ctx.drawImage(
							shader.shadeObject[i].texture.image,
							0,
							0
						);
						setup.ctx.restore();
					};
				};
				if(shader.shadeObject[i].fillFlag === true) {
					setup.ctx.fillStyle = "rgba("+
						parseInt(shader.shadeObject[i].fillColor.r*255) +","+
						parseInt(shader.shadeObject[i].fillColor.g*255) +","+
						parseInt(shader.shadeObject[i].fillColor.b*255) +","+
						shader.shadeObject[i].fillColor.a +")";
					setup.ctx.fill();
				};
				if(shader.shadeObject[i].strokeFlag === true) {
					setup.ctx.strokeStyle = "rgba("+
						parseInt(shader.shadeObject[i].strokeColor.r*255) +","+
						parseInt(shader.shadeObject[i].strokeColor.g*255) +","+
						parseInt(shader.shadeObject[i].strokeColor.b*255) +","+
						shader.shadeObject[i].strokeColor.a +")";
					setup.ctx.stroke();
				};
			};
		};
	}
};


var model = function(argument) {
	// base object
	this.vertices = new Object();
	this.verticesToGetFace = new Array();
	this.shadeObjects = new Object();
	this.shadeFlag = new Object();
	// model parameter
	this.fillFlag = argument.fillFlag;
	this.fillColor = argument.fillColor;
	this.strokeFlag = argument.strokeFlag;
	this.strokeColor = argument.strokeColor;
	
	
	this.size = argument.size;
	this.position = argument.position;
	this.rotate = argument.rotate;
	if(argument.texture != undefined) {
		this.texture = argument.texture;
	};
	
	var v0 = polarToRectangle(0, 0, 1);
	var v1 = polarToRectangle(60, 72, 1);
	var v2 = polarToRectangle(60, 144, 1);
	var v3 = polarToRectangle(60, 216, 1);
	var v4 = polarToRectangle(60, 288, 1);
	var v5 = polarToRectangle(60, 360, 1);
	var v6 = polarToRectangle(120, 72+30, 1);
	var v7 = polarToRectangle(120, 144+30, 1);
	var v8 = polarToRectangle(120, 216+30, 1);
	var v9 = polarToRectangle(120, 288+30, 1);
	var v10 = polarToRectangle(120, 360+30, 1);
	var v11 = polarToRectangle(180, 0, 1);
	this.vertexData = {
		v0 : {x:v0.x, y:v0.y, z:v0.z},
		v1 : {x:v1.x, y:v1.y, z:v1.z},
		v2 : {x:v2.x, y:v2.y, z:v2.z},
		v3 : {x:v3.x, y:v3.y, z:v3.z},
		v4 : {x:v4.x, y:v4.y, z:v4.z},
		v5 : {x:v5.x, y:v5.y, z:v5.z},
		v6 : {x:v6.x, y:v6.y, z:v6.z},
		v7 : {x:v7.x, y:v7.y, z:v7.z},
		v8 : {x:v8.x, y:v8.y, z:v8.z},
		v9 : {x:v9.x, y:v9.y, z:v9.z},
		v10 : {x:v10.x, y:v10.y, z:v10.z},
		v11 : {x:v11.x, y:v11.y, z:v11.z}
	};
	this.indexData = {
		f0 : ["v0", "v2", "v1"],
		f1 : ["v0", "v3", "v2"],
		f2 : ["v0", "v4", "v3"],
		f3 : ["v0", "v5", "v4"],
		f4 : ["v0", "v1", "v5"],

		f5 : ["v1", "v2", "v6"],
		f6 : ["v2", "v3", "v7"],
		f7 : ["v3", "v4", "v8"],
		f8 : ["v4", "v5", "v9"],
		f9 : ["v5", "v1", "v10"],

		f10 : ["v7", "v6", "v2"],
		f11 : ["v8", "v7", "v3"],
		f12 : ["v9", "v8", "v4"],
		f13 : ["v10", "v9", "v5"],
		f14 : ["v6", "v10", "v1"],

		f15 : ["v11", "v6", "v7"],
		f16 : ["v11", "v7", "v8"],
		f17 : ["v11", "v8", "v9"],
		f18 : ["v11", "v9", "v10"],
		f19 : ["v11", "v10", "v6"],
	};
	this.uvData = {
		f0 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f1 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f2 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f3 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f4 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f5 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f6 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f7 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f8 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f9 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f10 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f11 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f12 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f13 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f14 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f15 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f16 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f17 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f18 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f19 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}]
	};
	
	this.shadeFace = new Object();
	for(var i in this.indexData) this.shadeFace[i] = true;
	// vertices init
	for(i in this.vertexData) {
		this.vertices[i] = new vertex3d({
			position : this.position,
			vertex : {x:this.vertexData[i].x*this.size, y:this.vertexData[i].y*this.size, z:this.vertexData[i].z*this.size}
		});
		this.vertices[i].vertexUpdate();
	};
	// shadeObjects init
	for(var i in this.indexData) {
		this.shadeObjects[i] = new Object;
		this.shadeObjects[i].face = new Object;
		
		this.shadeObjects[i].fillFlag = this.fillFlag;
		this.shadeObjects[i].fillColor = this.fillColor;
		this.shadeObjects[i].strokeFlag = this.strokeFlag;
		this.shadeObjects[i].strokeColor = this.strokeColor;
	};
};
model.prototype = {
	controll : function(argument) {
		if(argument.size != undefined) {
			this.size = argument.size;
		};
		if(argument.position != undefined) {
			this.position = {
				x : argument.position.x,
				y : argument.position.y,
				z : argument.position.z
			};
		};
		if(argument.rotate != undefined) {
			this.rotate = {
				x : argument.rotate.x,
				y : argument.rotate.y,
				z : argument.rotate.z
			};
		};
		if(argument.texture != undefined) {
			this.texture = argument.texture;
		};
	},
	update : function() {
		for(var i in this.vertexData) {
			this.vertices[i].affineIn.vertex = {
				x : this.vertexData[i].x*(this.size),
				y : this.vertexData[i].y*(this.size),
				z : this.vertexData[i].z*(this.size)
			};
			this.vertices[i].affineIn.position = {
				x : this.position.x,
				y : this.position.y,
				z : this.position.z
			};
			this.vertices[i].affineIn.rotate = {
				x : this.rotate.x,
				y : this.rotate.y,
				z : this.rotate.z
			};
			this.vertices[i].vertexUpdate();
		};
		for(var i in this.indexData) {
			this.verticesToGetFace = [];
			for(var j=0; j<this.indexData[i].length; j++) this.verticesToGetFace.push(this.vertices[this.indexData[i][j]]);
			this.shadeObjects[i].face = getFace(this.verticesToGetFace);
			this.shadeObjects[i].fillFlag = this.fillFlag;
			this.shadeObjects[i].fillColor = this.fillColor;
			this.shadeObjects[i].strokeFlag = this.strokeFlag;
			this.shadeObjects[i].strokeColor = this.strokeColor;
			if(this.texture != undefined) {
				this.shadeObjects[i].texture = texture.generateTransformData(
					{
						image : this.texture,
						vertexPoint : [this.vertices[this.indexData[i][0]].affineOut, this.vertices[this.indexData[i][1]].affineOut, this.vertices[this.indexData[i][2]].affineOut],
						uvPoint : this.uvData[i]
					}
				);
			} else {
				this.shadeObjects[i].texture = null;
			};
			for(var j=0; j<this.indexData[i].length; j++) {
				/*if(
					-this.vertices[this.indexData[i][j]].affineOut.p >= 0 &&
					-this.vertices[this.indexData[i][j]].affineOut.p <= camera.distance.z/10
				) {
					this.shadeFlag[i] = true;
				} else {
					this.shadeFlag[i] = false;
				};*/
				this.shadeFlag[i] = true;
			};
		};
	},
	addShader : function() {
		for(var i in this.shadeObjects) {
			if(this.shadeFlag[i] == true) shader.shadeObject.push(this.shadeObjects[i]);
		};
	}
};


var trianglemodel = function(argument) {
	// base object
	this.vertices = new Object();
	this.verticesToGetFace = new Array();
	this.shadeObjects = new Object();
	this.shadeFlag = new Object();
	// model parameter
	this.fillFlag = argument.fillFlag;
	this.fillColor = argument.fillColor;
	this.strokeFlag = argument.strokeFlag;
	this.strokeColor = argument.strokeColor;
	
	this.size = argument.size;
	this.position = argument.position;
	this.rotate = argument.rotate;
	if(argument.texture != undefined) {
		this.texture = argument.texture;
	};
	
	this.vertexData = {
		v0 : {x:Math.cos(dtr(0)), y:0, z:Math.sin(dtr(0))},
		v1 : {x:Math.cos(dtr(120)), y:0, z:Math.sin(dtr(120))},
		v2 : {x:Math.cos(dtr(240)), y:0, z:Math.sin(dtr(240))},
		v3 : {x:0, y:Math.sqrt(3/2), z:0}
	};
	this.indexData = {
		f0 : ["v3", "v0", "v2"],
		f1 : ["v3", "v1", "v0"],
		f2 : ["v3", "v2", "v1"],
		f3 : ["v0", "v1", "v2"]
	};
	this.uvData = {
		f0 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f1 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f2 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}],
		f3 : [{x:0, y:1}, {x:0.5, y:0}, {x:1, y:1}]
	};
	
	this.shadeFace = new Object();
	for(var i in this.indexData) this.shadeFace[i] = true;
	// vertices init
	for(i in this.vertexData) {
		this.vertices[i] = new vertex3d({
			position : this.position,
			vertex : {x:this.vertexData[i].x*this.size, y:this.vertexData[i].y*this.size, z:this.vertexData[i].z*this.size}
		});
		this.vertices[i].vertexUpdate();
	};
	// shadeObjects init
	for(var i in this.indexData) {
		this.shadeObjects[i] = new Object;
		this.shadeObjects[i].face = new Object;
		
		this.shadeObjects[i].fillFlag = this.fillFlag;
		this.shadeObjects[i].fillColor = this.fillColor;
		this.shadeObjects[i].strokeFlag = this.strokeFlag;
		this.shadeObjects[i].strokeColor = this.strokeColor;
	};
};
trianglemodel.prototype = {
	controll : function(argument) {
		if(argument.size != undefined) {
			this.size = argument.size;
		};
		if(argument.position != undefined) {
			this.position = {
				x : argument.position.x,
				y : argument.position.y,
				z : argument.position.z
			};
		};
		if(argument.rotate != undefined) {
			this.rotate = {
				x : argument.rotate.x,
				y : argument.rotate.y,
				z : argument.rotate.z
			};
		};
		if(argument.texture != undefined) {
			this.texture = argument.texture;
		};
	},
	update : function() {
		for(var i in this.vertexData) {
			this.vertices[i].affineIn.vertex = {
				x : this.vertexData[i].x*(this.size),
				y : this.vertexData[i].y*(this.size),
				z : this.vertexData[i].z*(this.size)
			};
			this.vertices[i].affineIn.position = {
				x : this.position.x,
				y : this.position.y,
				z : this.position.z
			};
			this.vertices[i].affineIn.rotate = {
				x : this.rotate.x,
				y : this.rotate.y,
				z : this.rotate.z
			};
			this.vertices[i].vertexUpdate();
		};
		for(var i in this.indexData) {
			this.verticesToGetFace = [];
			for(var j=0; j<this.indexData[i].length; j++) this.verticesToGetFace.push(this.vertices[this.indexData[i][j]]);
			this.shadeObjects[i].face = getFace(this.verticesToGetFace);
			this.shadeObjects[i].fillFlag = this.fillFlag;
			this.shadeObjects[i].fillColor = this.fillColor;
			this.shadeObjects[i].strokeFlag = this.strokeFlag;
			this.shadeObjects[i].strokeColor = this.strokeColor;
			if(this.texture != undefined) {
				this.shadeObjects[i].texture = texture.generateTransformData(
					{
						image : this.texture,
						vertexPoint : [this.vertices[this.indexData[i][0]].affineOut, this.vertices[this.indexData[i][1]].affineOut, this.vertices[this.indexData[i][2]].affineOut],
						uvPoint : this.uvData[i]
					}
				);
			} else {
				this.shadeObjects[i].texture = null;
			};
			for(var j=0; j<this.indexData[i].length; j++) {
				/*if(
					-this.vertices[this.indexData[i][j]].affineOut.p >= 0 &&
					-this.vertices[this.indexData[i][j]].affineOut.p <= camera.distance.z/10
				) {
					this.shadeFlag[i] = true;
				} else {
					this.shadeFlag[i] = false;
				};*/
				this.shadeFlag[i] = true;
			};
		};
	},
	addShader : function() {
		for(var i in this.shadeObjects) {
			if(this.shadeFlag[i] == true) shader.shadeObject.push(this.shadeObjects[i]);
		};
	}
};


var triangleflatmodel = function(argument) {
	// base object
	this.vertices = new Object();
	this.verticesToGetFace = new Array();
	this.shadeObjects = new Object();
	this.shadeFlag = new Object();
	// model parameter
	this.fillFlag = argument.fillFlag;
	this.fillColor = argument.fillColor;
	this.strokeFlag = argument.strokeFlag;
	this.strokeColor = argument.strokeColor;
	
	this.size = argument.size;
	this.position = argument.position;
	this.rotate = argument.rotate;
	if(argument.texture != undefined) {
		this.texture = argument.texture;
	};
	
	this.vertexData = {
		v0 : {x:Math.cos(dtr(0+30)), y:Math.sin(dtr(0+30)), z:0},
		v1 : {x:Math.cos(dtr(120+30)), y:Math.sin(dtr(120+30)), z:0},
		v2 : {x:Math.cos(dtr(240+30)), y:Math.sin(dtr(240+30)), z:0}
	};
	this.indexData = {
		f0 : ["v0", "v1", "v2"],
		f1 : ["v2", "v1", "v0"]
	};
	this.uvData = {};
	
	this.shadeFace = new Object();
	for(var i in this.indexData) this.shadeFace[i] = true;
	// vertices init
	for(i in this.vertexData) {
		this.vertices[i] = new vertex3d({
			position : this.position,
			vertex : {x:this.vertexData[i].x*this.size, y:this.vertexData[i].y*this.size, z:this.vertexData[i].z*this.size}
		});
		this.vertices[i].vertexUpdate();
	};
	// shadeObjects init
	for(var i in this.indexData) {
		this.shadeObjects[i] = new Object;
		this.shadeObjects[i].face = new Object;
		
		this.shadeObjects[i].fillFlag = this.fillFlag;
		this.shadeObjects[i].fillColor = this.fillColor;
		this.shadeObjects[i].strokeFlag = this.strokeFlag;
		this.shadeObjects[i].strokeColor = this.strokeColor;
	};
};
triangleflatmodel.prototype = {
	controll : function(argument) {
		if(argument.size != undefined) {
			this.size = argument.size;
		};
		if(argument.position != undefined) {
			this.position = {
				x : argument.position.x,
				y : argument.position.y,
				z : argument.position.z
			};
		};
		if(argument.rotate != undefined) {
			this.rotate = {
				x : argument.rotate.x,
				y : argument.rotate.y,
				z : argument.rotate.z
			};
		};
		if(argument.texture != undefined) {
			this.texture = argument.texture;
		};
	},
	update : function() {
		for(var i in this.vertexData) {
			this.vertices[i].affineIn.vertex = {
				x : this.vertexData[i].x*(this.size),
				y : this.vertexData[i].y*(this.size),
				z : this.vertexData[i].z*(this.size)
			};
			this.vertices[i].affineIn.position = {
				x : this.position.x,
				y : this.position.y,
				z : this.position.z
			};
			this.vertices[i].affineIn.rotate = {
				x : this.rotate.x,
				y : this.rotate.y,
				z : this.rotate.z
			};
			this.vertices[i].vertexUpdate();
		};
		for(var i in this.indexData) {
			this.verticesToGetFace = [];
			for(var j=0; j<this.indexData[i].length; j++) this.verticesToGetFace.push(this.vertices[this.indexData[i][j]]);
			this.shadeObjects[i].face = getFace(this.verticesToGetFace);
			this.shadeObjects[i].fillFlag = this.fillFlag;
			this.shadeObjects[i].fillColor = this.fillColor;
			this.shadeObjects[i].strokeFlag = this.strokeFlag;
			this.shadeObjects[i].strokeColor = this.strokeColor;
			if(this.texture != undefined) {
				this.shadeObjects[i].texture = texture.generateTransformData(
					{
						image : this.texture,
						vertexPoint : [this.vertices[this.indexData[i][0]].affineOut, this.vertices[this.indexData[i][1]].affineOut, this.vertices[this.indexData[i][2]].affineOut],
						uvPoint : this.uvData[i]
					}
				);
			} else {
				this.shadeObjects[i].texture = null;
			};
			for(var j=0; j<this.indexData[i].length; j++) {
				/*if(
					-this.vertices[this.indexData[i][j]].affineOut.p >= 0 &&
					-this.vertices[this.indexData[i][j]].affineOut.p <= camera.distance.z/10
				) {
					this.shadeFlag[i] = true;
				} else {
					this.shadeFlag[i] = false;
				};*/
				this.shadeFlag[i] = true;
			};
		};
	},
	addShader : function() {
		for(var i in this.shadeObjects) {
			if(this.shadeFlag[i] == true) shader.shadeObject.push(this.shadeObjects[i]);
		};
	}
};


var diamondmodel = function(argument) {
	// base object
	this.vertices = new Object();
	this.verticesToGetFace = new Array();
	this.shadeObjects = new Object();
	this.shadeFlag = new Object();
	// model parameter
	this.fillFlag = argument.fillFlag;
	this.fillColor = argument.fillColor;
	this.strokeFlag = argument.strokeFlag;
	this.strokeColor = argument.strokeColor;
	
	this.size = argument.size;
	this.position = argument.position;
	this.rotate = argument.rotate;
	if(argument.texture != undefined) {
		this.texture = argument.texture;
	};
	
	this.vertexData = {
		v0 : {x:1*0.8, y:0, z:0},
		v0a : {x:0.92*0.8, y:0, z:0.025},
		v0b : {x:0.92*0.8, y:0, z:-0.025},
		
		v1 : {x:0, y:-1, z:0},
		v1a : {x:0, y:-0.92, z:0.025},
		v1b : {x:0, y:-0.92, z:-0.025},
		
		v2 : {x:-1*0.8, y:0, z:0},
		v2a : {x:-0.92*0.8, y:0, z:0.025},
		v2b : {x:-0.92*0.8, y:0, z:-0.025},
		
		v3 : {x:0, y:1, z:0},
		v3a : {x:0, y:0.92, z:0.025},
		v3b : {x:0, y:0.92, z:-0.025}
	};
	this.indexData = {
		f0 : ["v0a", "v0", "v1", "v1a"],
		f0a : ["v0b", "v0a", "v1a", "v1b"],
		f0b : ["v0", "v0b", "v1b", "v1"],
		f1 : ["v1a", "v1", "v2", "v2a"],
		f1a : ["v1b", "v1a", "v2a", "v2b"],
		f1b : ["v1", "v1b", "v2b", "v2"],
		f2 : ["v2a", "v2", "v3", "v3a"],
		f2a : ["v2b", "v2a", "v3a", "v3b"],
		f2b : ["v2", "v2b", "v3b", "v3"],
		f3 : ["v3a", "v3", "v0", "v0a"],
		f3a : ["v3b", "v3a", "v0a", "v0b"],
		f3b : ["v3", "v3b", "v0b", "v0"]
	};
	this.uvData = {
	};
	
	this.shadeFace = new Object();
	for(var i in this.indexData) this.shadeFace[i] = true;
	// vertices init
	for(i in this.vertexData) {
		this.vertices[i] = new vertex3d({
			position : this.position,
			vertex : {x:this.vertexData[i].x*this.size, y:this.vertexData[i].y*this.size, z:this.vertexData[i].z*this.size}
		});
		this.vertices[i].vertexUpdate();
	};
	// shadeObjects init
	for(var i in this.indexData) {
		this.shadeObjects[i] = new Object;
		this.shadeObjects[i].face = new Object;
		
		this.shadeObjects[i].fillFlag = this.fillFlag;
		this.shadeObjects[i].fillColor = this.fillColor;
		this.shadeObjects[i].strokeFlag = this.strokeFlag;
		this.shadeObjects[i].strokeColor = this.strokeColor;
	};
};
diamondmodel.prototype = {
	controll : function(argument) {
		if(argument.size != undefined) {
			this.size = argument.size;
		};
		if(argument.position != undefined) {
			this.position = {
				x : argument.position.x,
				y : argument.position.y,
				z : argument.position.z
			};
		};
		if(argument.rotate != undefined) {
			this.rotate = {
				x : argument.rotate.x,
				y : argument.rotate.y,
				z : argument.rotate.z
			};
		};
		if(argument.texture != undefined) {
			this.texture = argument.texture;
		};
	},
	update : function() {
		for(var i in this.vertexData) {
			this.vertices[i].affineIn.vertex = {
				x : this.vertexData[i].x*(this.size),
				y : this.vertexData[i].y*(this.size),
				z : this.vertexData[i].z*(this.size)
			};
			this.vertices[i].affineIn.position = {
				x : this.position.x,
				y : this.position.y,
				z : this.position.z
			};
			this.vertices[i].affineIn.rotate = {
				x : this.rotate.x,
				y : this.rotate.y,
				z : this.rotate.z
			};
			this.vertices[i].vertexUpdate();
		};
		for(var i in this.indexData) {
			this.verticesToGetFace = [];
			for(var j=0; j<this.indexData[i].length; j++) this.verticesToGetFace.push(this.vertices[this.indexData[i][j]]);
			this.shadeObjects[i].face = getFace(this.verticesToGetFace);
			this.shadeObjects[i].fillFlag = this.fillFlag;
			this.shadeObjects[i].fillColor = this.fillColor;
			this.shadeObjects[i].strokeFlag = this.strokeFlag;
			this.shadeObjects[i].strokeColor = this.strokeColor;
			if(this.texture != undefined) {
				this.shadeObjects[i].texture = texture.generateTransformData(
					{
						image : this.texture,
						vertexPoint : [this.vertices[this.indexData[i][0]].affineOut, this.vertices[this.indexData[i][1]].affineOut, this.vertices[this.indexData[i][2]].affineOut],
						uvPoint : this.uvData[i]
					}
				);
			} else {
				this.shadeObjects[i].texture = null;
			};
			for(var j=0; j<this.indexData[i].length; j++) {
				/*if(
					-this.vertices[this.indexData[i][j]].affineOut.p >= 0 &&
					-this.vertices[this.indexData[i][j]].affineOut.p <= camera.distance.z/10
				) {
					this.shadeFlag[i] = true;
				} else {
					this.shadeFlag[i] = false;
				};*/
				this.shadeFlag[i] = true;
			};
		};
	},
	addShader : function() {
		for(var i in this.shadeObjects) {
			if(this.shadeFlag[i] == true) shader.shadeObject.push(this.shadeObjects[i]);
		};
	}
};


	var cameraCv = new closeValue(200, 400);
	var selfhandle = {x:0, y:0};
	document.onmousemove = function(e) {
		selfhandle.x = e.pageX/setup.width * 300 - 150;
		selfhandle.y = e.pageY/setup.height * 300 - 150;
	};
	var overFilter = new Image();
	overFilter.src = "http://jsrun.it/assets/o/U/l/e/oUle7.png";
	var main = function() {
		var loop = function() {
			//setup.ctx.clearRect(0, 0, setup.width, setup.height);
			backgroundController();
			
			if(cameraCv.execution() > 0.8) {
				camera.self.x = Math.random()*80 - 40 - selfhandle.x;
				camera.self.y = Math.random()*80 - 40 + selfhandle.y;
				camera.zoom = 1.5;
			} else {
				camera.self.x = 0 - selfhandle.x;
				camera.self.y = 0 + selfhandle.y;
				camera.self.z = 300;
				camera.zoom = 1;
			};
			camera.update();
			shader.shadeObject = [];
			
			/*shaderObjectControll*/
			mainControll();
			triangleSphereControll();
			diamondArrayController();
			triangleFlatControll();
			/*shaderObjectControll*/
			
			//インスタンス処理
			shader.zSort();
			shader.flatShader.directionalLighting();
			shader.shade();
			
			//テクスチャ
			texUpdate();
			//テクスチャ
			
			/*affterEffectControll*/
			meshSphereControll();
			setup.ctx.save();
			setup.ctx.globalAlpha = Math.random()*0.5 + 0.5;
			setup.ctx.drawImage(overFilter, 0, Math.random()*2, setup.width, setup.height);
			setup.ctx.restore();
			/*affterEffectControll*/
		};
		var timerIteration = function() {
			setTimeout(function() {
				loop();
				timerIteration();
			}, 1000/60);
		};
		timerIteration();
	};
	
	
	
	
	/* mainObject */
	var mainObject = new model({
		fillFlag : true,
		fillColor : {r:1.0, g:1.0, b:1.0, a:0.2},
		strokeFlag : false,
		strokeColor : {r:1.0, g:1.0, b:1.0, a:1.0},
		size : 0,
		position : {x:0, y:0, z:0},
		rotate : {x:0, y:0, z:0}
	});
	var mainCvSize = new closeValue(100, 300);
	var mainCvRotateX = new closeValue(300, 1000);
	var mainCvRotateY = new closeValue(300, 1000);
	var mainCvRotateZ = new closeValue(300, 1000);
	/* mainControll */
	var mainControll = function() {
		mainObject.controll({
			size : mainCvSize.execution() * 120 + 40,
			rotate : {x:mainCvRotateX.execution()*360, y:mainCvRotateY.execution()*360, z:mainCvRotateZ.execution()*100},
			texture : get
		});
		mainObject.update();
		mainObject.addShader();
	};
	/* mainControll */
	/* mainObject */
	
	
	
	
	
	/* triangleobject */
	var triangleSphere = new Array();
	var triangleSphereParam = new Array();
	var triangleSphereMaster = {
		degree : {
			theta : 0,
			phi : 0,
			thetaCv : new closeValue(400, 1000),
			phiCv : new closeValue(400, 1000)
		}
	};
	for(var i=0; i<40; i++) {
		triangleSphereParam[i] = {
			theta : Math.random()*360,
			phi : Math.random()*360,
			radiusCv : new closeValue(50, 200),
			size : 15,
			sizeCv :  new closeValue(50, 100),
			rotateCv : {
				x : new closeValue(400, 800),
				y : new closeValue(400, 800),
				z : new closeValue(400, 800)
			}
		};
		if(Math.random() > 0.33) {
			triangleColor = {r:1.0, g:0.0, b:0.5, a:1};
		} else if(Math.random() > 0.66) {
			triangleColor = {r:0.5, g:1.0, b:0.0, a:1};
		} else {
			triangleColor = {r:0.0, g:0.5, b:1.0, a:1}
		};
		triangleSphere[i] = new trianglemodel({
			fillFlag : true,
			fillColor : {r:0.0, g:0.5, b:1.0, a:1},
			strokeFlag : false,
			strokeColor : {r:1.0, g:1.0, b:1.0, a:1},
			size : 0,
			position : {x:0, y:0, z:0},
			rotate : {x:0, y:0, z:0}
		});
	};
	/* triangleSphereControll */
	var triangleSphereControll = function() {
		triangleSphereMaster.degree.theta += triangleSphereMaster.degree.thetaCv.execution()*3;
		triangleSphereMaster.degree.phi += triangleSphereMaster.degree.phiCv.execution()*2;
		for(var i=0; i<triangleSphere.length; i++) {
			triangleSphereParam[i].theta += 0.5*Math.random()-0.25;
			triangleSphereParam[i].phi += 0.5*Math.random()-0.25;
			var getPosition = polarToRectangle(
				triangleSphereParam[i].theta + triangleSphereMaster.degree.theta,
				triangleSphereParam[i].phi + triangleSphereMaster.degree.phi + Math.random(),
				triangleSphereParam[i].radiusCv.execution()*150 + 100
			);
			triangleSphere[i].controll({
				position : {x:getPosition.x, y:getPosition.y, z:getPosition.z},
				size : triangleSphereParam[i].size * triangleSphereParam[i].sizeCv.execution(),
				rotate : {
					x:triangleSphereParam[i].rotateCv.x.execution()*360,
					y:triangleSphereParam[i].rotateCv.y.execution()*360,
					z:triangleSphereParam[i].rotateCv.z.execution()*360
				}
			});
			triangleSphere[i].update();
			triangleSphere[i].addShader();
		};
	};
	/* mainControll */
	/* triangleobject */
	
	
	
	
	
	/* triangleflatobject */
	var triangleFlat = new Array();
	var triangleFlatParam = new Array();
	var triangleFlatRotateFlagCv = new closeValue(200, 400);
	var triangleFlatSpanCv = new closeValue(30, 100);
	var triangleFlatCount = 8;
	var triangleFlatNums = [];
		for(var i=triangleFlatCount; i>=0; i--) {
			triangleFlatNums.push(triangleFlatCount);
			triangleFlatCount--;
		};
	var widthspan = 0;
	var heightspan = 0;
	for(var i=0; i<triangleFlatNums.length; i++) {
		triangleFlat[i] = new Array();
		triangleFlatParam[i] = new Array();
		for(var j=0; j<triangleFlatNums[i]; j++) {
			triangleFlatParam[i][j] = {
				rotate : {
					x:0,
					y:0,
					z:0
				},
				rotateMem : {
					x:0,
					y:0,
					z:0
				},
				rotateCv : {
					x:new closeValue(200, 400),
					y:new closeValue(200, 400),
					z:new closeValue(200, 400)
				}
			};
			triangleFlat[i][j] = new triangleflatmodel({
				fillFlag : true,
				fillColor : {r:0.4, g:1.0, b:0, a:1},
				strokeFlag : false,
				strokeColor : {r:1.0, g:1.0, b:1.0, a:1},
				size : 25,
				position : {
					x:(j-triangleFlatNums[i]/2)*widthspan + widthspan/2,
					y:-(i-triangleFlatNums[0]/2)*heightspan - heightspan,
					z:-500
				},
				rotate : {x:0, y:0, z:0}
			});
		};
	};
	var triangleFlatControll = function() {
		var triangleFlatSpan = triangleFlatSpanCv.execution()*90+20;
		var widthspan = triangleFlatSpan;
		var heightspan = triangleFlatSpan;
		for(var i=0; i<triangleFlat.length; i++) {
			for(var j=0; j<triangleFlat[i].length; j++) {
				if(triangleFlatRotateFlagCv.execution() > 0.5) {
					triangleFlatParam[i][j].rotateMem.x += triangleFlatParam[i][j].rotateCv.x.execution()*15;
					triangleFlatParam[i][j].rotateMem.y += triangleFlatParam[i][j].rotateCv.y.execution()*15;
					triangleFlatParam[i][j].rotateMem.z += triangleFlatParam[i][j].rotateCv.z.execution()*15;
					triangleFlat[i][j].controll({
						position : {
							x:(j-triangleFlatNums[i]/2)*widthspan + widthspan/2,
							y:-(i-triangleFlatNums[0]/2)*heightspan - heightspan,
							z:-400
						},
						rotate : triangleFlatParam[i][j].rotateMem
					});
				} else {
						triangleFlat[i][j].controll({
						position : {
							x:(j-triangleFlatNums[i]/2)*widthspan + widthspan/2,
							y:-(i-triangleFlatNums[0]/2)*heightspan - heightspan,
							z:-400
						},
						rotate : triangleFlatParam[i][j].rotate
					});
				};
				triangleFlat[i][j].update();
				triangleFlat[i][j].addShader();
			};
		};
	};
	/* triangleflatobject */
	
	
	
	
	/* diamondObject */
	var diamondArray = new Array();
	var diamondArrayParam = new Array();
	for(var i=0; i<3; i++) {
		diamondArrayParam[i] = {
			rotate : {x:0, y:0, z:0},
			rotateCv : {
				x : new closeValue(200, 800),
				y : new closeValue(200, 800),
				z : new closeValue(200, 800)
			},
			position : {x:0, y:0, z:0},
			positionCv : {
				x : new closeValue(200, 800),
				y : new closeValue(200, 800),
				z : new closeValue(200, 800)
			}
		};
		diamondArray[i] = new diamondmodel({
			fillFlag : true,
			fillColor : {r:1.0, g:0.0, b:0.5, a:1},
			strokeFlag : false,
			strokeColor : {r:1.0, g:1.0, b:1.0, a:1},
			size : 150 + 100*Math.random(),
			position : {x:0, y:0, z:0},
			rotate : {x:0, y:0, z:0}
		});
	};
	var diamondArrayController = function() {
		for(var i=0; i<diamondArray.length; i++) {
			diamondArrayParam[i].rotate.x += diamondArrayParam[i].rotateCv.x.execution()*3;
			diamondArrayParam[i].rotate.y += diamondArrayParam[i].rotateCv.y.execution()*10;
			diamondArrayParam[i].rotate.z += diamondArrayParam[i].rotateCv.z.execution()*5;
			
			diamondArrayParam[i].position.z = diamondArrayParam[i].positionCv.z.execution()*-150 + 50;
			diamondArray[i].controll({
				rotate : {
					x : diamondArrayParam[i].rotate.x,
					y : diamondArrayParam[i].rotate.y,
					z : diamondArrayParam[i].rotate.z
				},
				position : {
					x : 0,
					y : 0,
					z : diamondArrayParam[i].position.z 
				}
			});
			diamondArray[i].update();
			diamondArray[i].addShader();
		};
	};
	/* diamondObject */
	
	
	
	/*mesh1*/
	var meshSphere = function(arg) {
		this.mv = new Array();
		this.cv = new Array();
		this.count = Math.floor(2+5*Math.random());
		this.nums = [];
		for(var i=this.count; i>=0; i--) {
			this.nums.push(this.count);
			this.count--;
		};
		this.widthspan = 12;
		this.heightspan = 12;
		this.position = arg.position;
		this.rotate = arg.rotate;
		for(var i=0; i<this.nums.length; i++) {
			this.mv[i] = new Array();
			for(var j=0; j<this.nums[i]; j++) {
				this.mv[i][j] = new vertex3d({
					vertex : {
						x:(j-this.nums[i]/2)*this.widthspan,
						y:0,
						z:-(i-this.nums[0]/2)*this.heightspan
					},
					position : this.position,
					rotate : this.rotate
				});
			};
		};
	};
	meshSphere.prototype = {
		update : function() {
			for(var i=0; i<this.mv.length; i++) {
				for(var j=0; j<this.mv[i].length; j++) {
					this.mv[i][j].affineIn.vertex = {
						x:(j-this.nums[i]/2)*this.widthspan,
						y:0,
						z:-(i-this.nums[0]/2)*this.heightspan
					};
					this.mv[i][j].affineIn.position = this.position;
					this.mv[i][j].affineIn.rotate = this.rotate;
					if(Math.random() > 0.98) {
						this.mv[i][j].affineIn.vertex.y = 100*Math.random();
					} else if(Math.random() > 0.8) {
						this.mv[i][j].affineIn.vertex.y = 20*Math.random();
					} else if(Math.random() > 0.5) {
						this.mv[i][j].affineIn.vertex.y = 2*Math.random();
					};
					this.mv[i][j].vertexUpdate();
				};
			};
		},
		draw : function() {
			setup.ctx.strokeStyle = effectStroke;
			setup.ctx.lineWidth = 0.3;
			for(var i=0; i<this.mv.length; i++) {
				for(var j=0; j<this.mv[i].length; j++) {
						if(this.mv[i][j+1] != undefined) {
							setup.ctx.beginPath();
							setup.ctx.moveTo(this.mv[i][j].affineOut.x, this.mv[i][j].affineOut.y);	
							setup.ctx.lineTo(this.mv[i][j+1].affineOut.x, this.mv[i][j+1].affineOut.y);
							setup.ctx.closePath();
							setup.ctx.stroke();
						};
						/*if(this.mv[i+1] != undefined) {
							if(this.mv[i+1][j] != undefined) {
								setup.ctx.beginPath();
								setup.ctx.moveTo(this.mv[i][j].affineOut.x, this.mv[i][j].affineOut.y);	
								setup.ctx.lineTo(this.mv[i+1][j].affineOut.x, this.mv[i+1][j].affineOut.y);
								setup.ctx.closePath();
								setup.ctx.stroke();
							};
						};
						if(this.mv[i+1] != undefined) {
							if(this.mv[i+1][j-1] != undefined) {
								setup.ctx.beginPath();
								setup.ctx.moveTo(this.mv[i][j].affineOut.x, this.mv[i][j].affineOut.y);	
								setup.ctx.lineTo(this.mv[i+1][j-1].affineOut.x, this.mv[i+1][j-1].affineOut.y);
								setup.ctx.closePath();
								setup.ctx.stroke();
							};
						};*/
				};
			};
		}
	};
	/* mesh controll */
	var meshSphereInstance = new Array();
	var meshSphereParam = new Array();
	var meshSphereMaster = {
		degree : {
			theta : 0,
			phi : 0,
			cvTheta : new closeValue(150, 1000),
			cvPhi : new closeValue(150, 1000)
		},
		radius : {
			value : 0,
			valueCv : new closeValue(50, 200)
		}
	}
	for(var i=0; i<40; i++) {
		meshSphereParam[i] = {
			theta : Math.random()*360,
			phi : Math.random()*360,
			speedTheta : Math.random() * 2  - 1,
			speedPhi : Math.random() * 2 - 1
		};
		var getPosition = polarToRectangle(0, 0, 0);
		meshSphereInstance[i] = new meshSphere(
			{
				position:{x:getPosition.x,y:getPosition.y,z:getPosition.z},
				rotate:{x:meshSphereParam[i].theta,y:meshSphereParam[i].phi,z:0}
			}
		);
	};
	meshSphereControll = function() {
		meshSphereMaster.radius.value = 150+50*meshSphereMaster.radius.valueCv.execution();
		meshSphereMaster.degree.theta += 2 * meshSphereMaster.degree.cvTheta.execution();
		meshSphereMaster.degree.phi += 0 * meshSphereMaster.degree.cvPhi.execution();
		for(var i=0; i<meshSphereInstance.length; i++) {
			meshSphereInstance[i].update();
			
			meshSphereParam[i].theta += meshSphereParam[i].speedTheta;
			meshSphereParam[i].phi += meshSphereParam[i].speedPhi;
			getPosition = polarToRectangle(
				meshSphereParam[i].theta + meshSphereMaster.degree.theta,
				meshSphereParam[i].phi + meshSphereMaster.degree.phi,
				meshSphereMaster.radius.value
			);
			meshSphereInstance[i].position = getPosition;
			meshSphereInstance[i].rotate = {
				x : meshSphereParam[i].theta + meshSphereMaster.degree.theta,
				y : meshSphereParam[i].phi + meshSphereMaster.degree.phi,
				z : 0
			};
		};
		for(var i=0; i<meshSphereInstance.length; i++) meshSphereInstance[i].draw();
	}; 
	/* mesh controll */
	/*mesh1*/
	
	
	
	
	
	/*mainTexture*/
	var texCanvas = document.getElementById("texCanvas");
	tCtx = texCanvas.getContext("2d");
	var get = document.getElementById("get");
	var texType = "a";
	var texParam = {
		cv : new closeValue(200, 800),
		typeA : {
			stSpan : 10,
			stTra : []
		},
		typeB : {
			stSpan : 5,
			stTra : []
		},
		typeC : {
			radius : 0
		}
	};
	for(var i=0; i<20; i++) texParam.typeA.stTra.push(texParam.typeA.stSpan*i*4);
	for(var i=0; i<20; i++) texParam.typeB.stTra.push(texParam.typeB.stSpan*i*4);
	var texUpdate = function(){
		if(texParam.cv.execution() > 0.6) {
			texType = "a";
		} else if(texParam.cv.execution() > 0.3) {
			texType = "b";
		} else {
			texType = "c";
		};
		
		if(texType === "a") {
			tCtx.fillStyle = "rgba(255,255,255,1)";
			tCtx.fillRect(0, 0, 200, 200);
			for(var i=0; i<texParam.typeA.stTra.length; i++) {
				tCtx.beginPath();
				if(Math.random() > 0.7) {
					if(Math.random() > 0.5) {
						tCtx.fillStyle = "rgba(0,150,255,1)";
					} else {
						tCtx.fillStyle = "rgba(150,255,0,1)";
					};
				} else {
					tCtx.fillStyle = "rgba(0,0,0,1)";
				};
				tCtx.fillRect(texParam.typeA.stTra[i], 0, texParam.typeA.stSpan, 200);
				tCtx.closePath();
				texParam.typeA.stTra[i]+=7;
				if(texParam.typeA.stTra[i] >= 200) {texParam.typeA.stTra[i] = 0;};
			};
		} else if(texType === "b") {
			tCtx.fillStyle = "rgba(0,0,0,1)";
			tCtx.fillRect(0, 0, 200, 200);
			for(var i=0; i<texParam.typeB.stTra.length; i++) {
				tCtx.beginPath();
				if(Math.random() > 0.7) {
					tCtx.fillStyle = "rgba(255,0,100,1)";
				} else {
					tCtx.fillStyle = "rgba(255,255,255,1)";
				};
				tCtx.fillRect(texParam.typeB.stTra[i], 0, texParam.typeB.stSpan, 200);
				tCtx.closePath();
				texParam.typeB.stTra[i]+=7;
				if(texParam.typeB.stTra[i] >= 200) {texParam.typeB.stTra[i] = 0;};
			};
		} else if(texType === "c") {
			texParam.typeC.radius = 70 + Math.random()*10;
			tCtx.fillStyle = "rgba(0,0,0,1)";
			tCtx.fillRect(0, 0, 200, 200);
			tCtx.beginPath();
				tCtx.moveTo(Math.cos(dtr(0+30))*texParam.typeC.radius+100, Math.sin(dtr(0+30))*texParam.typeC.radius+100);
				tCtx.lineTo(Math.cos(dtr(120+30))*texParam.typeC.radius+100, Math.sin(dtr(120+30))*texParam.typeC.radius+100);
				tCtx.lineTo(Math.cos(dtr(240+30))*texParam.typeC.radius+100, Math.sin(dtr(240+30))*texParam.typeC.radius+100);
			tCtx.closePath();
			tCtx.fillStyle = "rgba(255,255,255,1)";
			tCtx.fill();
		};
		
		get.src = texCanvas.toDataURL();
	};
	/*mainTexture*/
	
	
	
	
	
	/* backgroundController */
	var effectStroke = "rgba(255,255,255,1)";
	var backgroundParam = {
		flag : 0,
		flagCv : new closeValue(200, 800),
		triangleFlag : 0,
		triangleFlagCv : new closeValue(200, 800),
		triangleRadius : 150,
		objectStrokeFlag : 0,
		objectStrokeFlagCv : new closeValue(200, 1000),
		spectrumFlag : 0,
		spectrumFlagCv :  new closeValue(500, 1000)
	};
	var backgroundController = function() {
		setup.ctx.lineWidth = 0.4;
		if(backgroundParam.flagCv.execution() > 0.7) {
			backgroundParam.flag = 1;
			effectStroke = "rgba(0,0,0,1)";
		} else {
			backgroundParam.flag = 0;
			effectStroke = "rgba(255,255,255,1)";
		};
		
		if(backgroundParam.triangleFlagCv.execution() > 0.5) {
			backgroundParam.triangleFlag = 0;
		} else {
			backgroundParam.triangleFlag = 1;
		};
		
		if(backgroundParam.spectrumFlagCv.execution() > 0.5) {
			backgroundParam.spectrumFlag = 0;
		} else {
			backgroundParam.spectrumFlag = 1;
		};
		
		if(backgroundParam.flag === 0) {
			if(backgroundParam.spectrumFlag == 0) {
				setup.ctx.clearRect(0, 0, setup.width, setup.height);
				setup.ctx.fillStyle = "rgba(0, 0, 0, 1)";
				setup.ctx.fillRect(0, 0, setup.width, setup.height);
			} else {
				setup.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
				setup.ctx.fillRect(0, 0, setup.width, setup.height);
			};
			if(backgroundParam.objectStrokeFlagCv.execution() > 0.8) {
				mainObject.strokeFlag = true;
				mainObject.fillFlag = false;
				for(var i=0; i<triangleSphere.length; i++) {
					triangleSphere[i].strokeFlag = true;
					triangleSphere[i].fillFlag = false;
				};
				for(var i=0; i<triangleFlat.length; i++) {
					for(var j=0; j<triangleFlat[i].length; j++) {
						triangleFlat[i][j].strokeFlag = true;
						triangleFlat[i][j].fillFlag = false;
					};
				};
				for(var i=0; i<diamondArray.length; i++) {
					diamondArray[i].strokeFlag = true;
					diamondArray[i].fillFlag = false;
				};
			} else {
				mainObject.strokeFlag = false;
				mainObject.fillFlag = true;
				for(var i=0; i<triangleSphere.length; i++) {
					triangleSphere[i].strokeFlag = false;
					triangleSphere[i].fillFlag = true;
				};
				for(var i=0; i<triangleFlat.length; i++) {
					for(var j=0; j<triangleFlat[i].length; j++) {
						triangleFlat[i][j].strokeFlag = false;
						triangleFlat[i][j].fillFlag = true;
					};
				};
				for(var i=0; i<diamondArray.length; i++) {
					diamondArray[i].strokeFlag = false;
					diamondArray[i].fillFlag = true;
				};
			};
		} else if(backgroundParam.flag === 1) {
			if(backgroundParam.spectrumFlag == 0) {
				setup.ctx.clearRect(0, 0, setup.width, setup.height);
				setup.ctx.fillStyle = "rgba(255, 255, 255, 1)";
				setup.ctx.fillRect(0, 0, setup.width, setup.height);
			} else {
				setup.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
				setup.ctx.fillRect(0, 0, setup.width, setup.height);
			};
			
				mainObject.strokeFlag = false;
				mainObject.fillFlag = true;
				for(var i=0; i<triangleSphere.length; i++) {
					triangleSphere[i].strokeFlag = false;
					triangleSphere[i].fillFlag = true;
				};
				for(var i=0; i<triangleFlat.length; i++) {
					for(var j=0; j<triangleFlat[i].length; j++) {
						triangleFlat[i][j].strokeFlag = false;
						triangleFlat[i][j].fillFlag = true;
					};
				};
				for(var i=0; i<diamondArray.length; i++) {
					diamondArray[i].strokeFlag = false;
					diamondArray[i].fillFlag = true;
				};
			if(backgroundParam.triangleFlag === 1) {
				var randomRadius = Math.random()*50;
				setup.ctx.beginPath();
				setup.ctx.moveTo(
					Math.cos(dtr(0+30))*(backgroundParam.triangleRadius+randomRadius)+setup.width/2,
					Math.sin(dtr(0+30))*(backgroundParam.triangleRadius+randomRadius)+setup.height/2
				);
				setup.ctx.lineTo(
					Math.cos(dtr(120+30))*(backgroundParam.triangleRadius+randomRadius)+setup.width/2,
					Math.sin(dtr(120+30))*(backgroundParam.triangleRadius+randomRadius)+setup.height/2
				);
				setup.ctx.lineTo(
					Math.cos(dtr(240+30))*(backgroundParam.triangleRadius+randomRadius)+setup.width/2,
					Math.sin(dtr(240+30))*(backgroundParam.triangleRadius+randomRadius)+setup.height/2
				);
				setup.ctx.closePath();
				setup.ctx.fillStyle = "rgba(0, 0, 0, 1)";
				setup.ctx.fill();
			};
		};
	};
	main();