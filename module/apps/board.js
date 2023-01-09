import { moduleId, localizationID } from "../const.js";

export class SkillBoard extends Application {
    static instance = null;

    static activate() {
        if (!this.instance) {
            this.instance = new SkillBoard();
        }

        if (!this.instance.rendered) {
            this.instance.render(true);
        } else {
            this.instance.bringToTop();
        }
    }

    static async refreshIfVisible() {
        if (this.instance && this.instance.rendered) {
            await this.instance?.render(true);    
        }
    }

    static async refresh(updateLayout) {
        if (updateLayout && this.instance) {
            await this.instance.close();
            this.instance = null;
            SkillBoard.activate();
            return;
        }
        await this.instance?.render(true);
    }

    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const renderAsPopout = game.settings.get(moduleId, 'renderAsPopout');

        const overrides = {
            classes: ['skill-board', 'sheet'],
            template: `modules/${moduleId}/templates/skill-board.hbs`,
            title: `${localizationID}.app-title`
        };

        if (renderAsPopout) {
            overrides.classes.push('sidebar-popout');
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;
    }

    static toggle() {
        if (!this.instance) {
            SkillBoard.activate();
        } else if (!this.instance.rendered) {
            this.instance.render(true);
        } else {
            this.instance.close();
        }
    }

    getData(options) {
        const primaryActor = game.user.character;
        const otherActors = game.settings.get(moduleId, 'additionalActors').map(id => {
            const actor = game.actors.get(id);
            if (actor?.permission >= 3 && actor !== primaryActor) {
                return actor;
            }
            return null;
        }).filter(a => a)
        const actors = [primaryActor, ...otherActors].filter(a => a);

        console.log(actors, actors.length == 0);

        return {
            isEmpty: !actors || actors.length == 0,
            skills: CONFIG.DND5E.skills,
            actors: actors.map(a => {
                return {
                    actor: a,
                    name: a.name?.split(' ')[0] || "--",
                    skills: a.system.skills,
                    image: a.prototypeToken.texture.src
                }
            })
        }
    }

    activateListeners(html) {
        html.find('.skill-board__rollable').click(this._onRollSkillCheck.bind(this));
        html.find('.skill-board__rollable').on("contextmenu", this._onRollSkillCheckFast.bind(this));
        html.find('.skill-board__actorlink').click(this._onOpenCharacterSheet.bind(this));
    }

    _onRollSkillCheck(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        const actorId = event.currentTarget.dataset.actorid;
        const actor = game.actors.get(actorId);
        return actor.rollSkill(skill, { event: event });
    }

    _onRollSkillCheckFast(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        const actorId = event.currentTarget.dataset.actorid;
        const actor = game.actors.get(actorId);
        return actor.rollSkill(skill, { event: event, fastForward: true });
    }

    _onOpenCharacterSheet(event) {
        event.preventDefault();
        const actorId = event.currentTarget.dataset.actorid;
        const actor = game.actors.get(actorId);
        game.actors.get(actorId).sheet.render(true);
    }
}