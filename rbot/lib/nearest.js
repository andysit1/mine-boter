const Vec3 = require('vec3').Vec3;

let bot,isNotEmpty,blocks;

function init(_bot,_isNotEmpty,_blocks)
{
	bot=_bot;
	isNotEmpty=_isNotEmpty;
	blocks=_blocks;
}


function sameBlock(pos1,pos2)
{
	return pos1.floored().equals(pos2.floored());
}

function visiblePosition(a,b)
{
	let v=b.minus(a);
	const t=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
	v=v.scaled(1/t);
	v=v.scaled(1/5);
	const u=t*5;
	let na;
	for(let i=1;i<u;i++)
	{
		na=a.plus(v);
		if(!sameBlock(na,a))
		{
			if(isNotEmpty(na)) return false;
		}
		a=na;
	}
	return true;
}

function blockNameToBlockType(blockName)
{
	return blocks[blockName].id;
}

function nearestBlock_(blockName)
{
  let blockType;
	if(blockName==='*') blockType=-1;
	else blockType=blockNameToBlockType(blockName);
	let dmax=new Vec3(64,64,64),block,dmin=100000000,bmin=null,d;
	let x,y,z;
	for(x=-dmax.x;x<dmax.x;x++)
	{
		for(y=-dmax.y;y<dmax.y;y++)
		{
			for(z=-dmax.z;z<dmax.z;z++)
			{
				d=x*x+y*y+z*z;
				if(d<dmin)
				{
					block=bot.blockAt(bot.entity.position.offset(x,y,z));
					if(block!==null && (blockType===-1 || block.type===blockType))
					{
							bmin=block;
							dmin=d;
						
					}
				}
			}
		}
	}
	return bmin;
}

function nearestBlock__(blockName)
{
  let blockType;
	if(blockName==='*') blockType=-1; // change this ...
	else blockType=blockNameToBlockType(blockName);
	const p=bot.findBlock(bot.entity.position,blockType,64);
	let pos=new Vec3(p[0],p[1],p[2]);
	pos=pos.floored();
	return bot.blockAt(pos);
}

function nearestBlock(blockName,done)
{
  let blockType;
	if(blockName==='*') blockType=-1; // change this ...
	else blockType=blockNameToBlockType(blockName);
	bot.findBlock({
		point: bot.entity.position,
		matching: blockType,
		maxDistance: 256,
		count: 1
	}, function(err, blockPoints) {
		if (err) {
			console.log('Error trying to find Diamond Ore: ' + err);
			done(null);
			return;
		}
		if (blockPoints.length) {
			done(blockPoints[0]);
		}
		else {
			console.log("I couldn't find any "+blockName+" blocks within 256.");
			done(null);
		}
	});
}

function remove(a,e)
{
	return a.filter(function(v) { return v !== e;});
}

function nearestVisibleEntity(entities)
{
	let ent;
	while(1)
	{
		ent=nearestEntity(entities);
		if(!visiblePosition(bot.entity.position.offset(0,bot.entity.height*0.5,0),ent.position))
		{
			if(entities.length>1) entities=remove(entities,ent); // to change ?
			else return null;
		}
		else return ent;
	}
}

function positionReachable(pos,params)
{
	return bot.navigate.findPathSync(pos,params).status === 'success';
}

function nearestReachableEntity(entities)
{
	let ent;
	while(1) // see if a too long computation couldn't cause problem (fork ?)
	{
		ent=nearestEntity(entities);
		if(!positionReachable(ent.position))
		{
			if(entities.length>1) entities=remove(entities,ent); // to change ?
			else return null;
		}
		else return ent;
	}
}

function nearestEntity(entities)
{
	const r=entities.reduce(function(acc,entity)
	{
		const d=entity.position.distanceTo(bot.entity.position);
		if(d<acc[1])
		{
			acc[0]=entity;
			acc[1]=d;
		}
		return acc;
	},[null,1000000]);
	return r[0];
}


function nearestReachablePosition(pos)
{
// 	let dmax=new Vec3(5,10,5),dmin=100000000,d,pmin=null,p,b;
// 	let x,y,z;
// 	for(x=-dmax.x;x<dmax.x;x++)
// 	{
// 		for(y=-dmax.y;y<dmax.y;y++)
// 		{
// 			for(z=-dmax.z;z<dmax.z;z++)
// 			{
// 				d=x*x+y*y+z*z;
// 				if(d<dmin)
// 				{
// 					p=pos.offset(x,y,z);
// 					if(isFree(p))
// 					{
// 						dmin=d;
// 						pmin=p;
// 					}
// 				}
// 			}
// 		}
// 	}
	const a=bot.navigate.findPathSync(pos,{timeout:2000});
	return a.path[a.path.length-1];
}

function closeOf(s)
{
	const type=blocks[s].id;
	let cursor = new Vec3();
	for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++)
	{
		for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++)
		{
			for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++)
			{
				const block = bot.blockAt(cursor);
				if (block.type === type) return true;
			}
		}
	}
	return false;
}

module.exports={
	visiblePosition:visiblePosition,
	nearestBlock:nearestBlock,
	nearestVisibleEntity:nearestVisibleEntity,
	nearestReachableEntity:nearestReachableEntity,
	nearestEntity:nearestEntity,
	nearestReachablePosition:nearestReachablePosition,
	closeOf:closeOf,
	sameBlock:sameBlock,
	init:init
};