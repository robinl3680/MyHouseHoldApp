import { Action, Selector, State, StateContext } from "@ngxs/store";
import { DummyInterFace, SetData } from "../actions/dummy.action";

@State<DummyInterFace>({
    name: 'Check',
    defaults: {
        name: null,
        data: null
    }
})
export class DummyState {
    @Selector()
    static getData(state: DummyInterFace) {
        if(state.data) return state.data;
    }
    @Action(SetData)
    setData(ctx: StateContext<DummyInterFace>, action: SetData) {
        ctx.patchState({
            ...{
                data: action.data
            }
        })
    }
}