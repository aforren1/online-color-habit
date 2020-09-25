import json
import numpy as np
from numpy.random import default_rng
# gist:
# free RT trial list is just list of keys, e.g. ['h', 'i', 'l', 'i', ...].
# forced RT adds list of prep times, e.g. [0.4, 0.3, 0.2, 0.5, 0.5]
# (TODO: build warmup into forced RT trial generation-- 2 of each on easy mode)
# when trial starts, look up what color should be shown. Example syntax:
# group_settings['action_color_map'][letter][block_settings['remap']]
# if not remapped, all fine. Otherwise, h color shows for u, and vice versa
c1 = '#ff007d'
c2 = '#bd5e00'
c3 = '#009800'
c4 = '#00a0ff'
group1 = {
    'action_color_map':  {'h': [c1, c2],
                          'u': [c2, c1],
                          'i': [c3, c3],
                          'l': [c4, c4]
                          },
    'spaced': ['h', 'i'],
    'massed': ['u', 'l'],
    'swapped': ['h', 'u'],  # for documentation, not necessary in experiment
    # lists of day-by-day sections
    # (localStorage tracks day as stringified day, so we can index directly into this)
    'days': {'1': [],
             '2': [],
             '3': [],
             '4': [],
             '5': []}
}

group2 = {
    'action_color_map':  {'h': [c3, c4],
                          'u': [c4, c3],
                          'i': [c1, c1],
                          'l': [c2, c2]
                          },
    'spaced': ['u', 'l'],
    'massed': ['h', 'i'],
    'swapped': ['h', 'u'],  # for documentation, not necessary in experiment
    # lists of day-by-day sections
    # (localStorage tracks day as stringified day, so we can index directly into this)
    'days': {'1': [],
             '2': [],
             '3': [],
             '4': [],
             '5': []}
}

group3 = {
    'action_color_map':  {'h': [c3, c3],
                          'u': [c1, c4],
                          'i': [c2, c2],
                          'l': [c4, c1]
                          },
    'spaced': ['h', 'u'],
    'massed': ['i', 'l'],
    'swapped': ['u', 'l'],  # for documentation, not necessary in experiment
    # lists of day-by-day sections
    # (localStorage tracks day as stringified day, so we can index directly into this)
    'days': {'1': [],
             '2': [],
             '3': [],
             '4': [],
             '5': []}
}

# TODO: debug settings
debug = {
    'action_color_map':  {'h': [c1, c2],
                          'u': [c2, c1],
                          'i': [c3, c3],
                          'l': [c4, c4]
                          },
    'spaced': ['h', 'i'],
    'massed': ['u', 'l'],
    'swapped': ['h', 'u'],  # for documentation, not necessary in experiment
    # lists of day-by-day sections
    # (localStorage tracks day as stringified day, so we can index directly into this)
    'days': {'1': [],
             '2': [],
             '3': [],
             '4': [],
             '5': []}
}


def make_freert():
    return {
        'task': 'FreeRT',
        'stim_type': 'finger',  # finger/color
        'swap': 0,
        'trial_order': [],  # list of keys
    }


def make_forcedrt():
    return {
        'task': 'ForcedRT',
        'stim_type': 'finger',  # practice/finger/color
        'swap': 0,
        'trial_order': [],  # list of keys
        'prep_times': []
    }


keys = ['h', 'u', 'i', 'l']


def make_key_seq(rng, repeat_per_finger=20, key_subset=None):
    # always have one set of openers for comfort
    k = key_subset * repeat_per_finger
    rng.shuffle(k)
    return k


def mk_single_tr(k, t_min, t_max):
    # TODO: fancier generation (5 chunks of 100, so we can
    # do cross-block comparisons more easily)
    # TODO: Maybe more than 125 per finger?
    out = np.empty(175, dtype=[('pt', 'f8'), ('key', '<U1')])
    # spaced every 2 frames, going from 0.05 to 0.85
    out['pt'] = (2/60 * np.arange(0, 25, 1) + 0.05).repeat(7)
    out['key'] = k
    return out


def make_tr_vals(rng, intro=2, t_min=0.05, t_max=0.9):
    # we want to make sure each key has a pretty uniform distribution
    # keep in mind these are sort of garbage-- real presentation times
    # depend on requestAnimationFrame time + frame rate, so it ends up being
    # discretized...
    h = mk_single_tr('h', t_min, t_max)
    u = mk_single_tr('u', t_min, t_max)
    i = mk_single_tr('i', t_min, t_max)
    l = mk_single_tr('l', t_min, t_max)
    out = np.hstack((h, u, i, l))
    rng.shuffle(out)
    kys = list(out['key'])
    pts = list(out['pt'])
    kys = keys * intro + kys
    pts = [t_max - 0.1] * 4 * intro + pts
    return kys, pts


# make debug
# add days to test specific things
cp = make_freert()
cp['trial_order'] = ['h', 'u', 'i', 'l']
debug['days']['1'].append(cp)  # day1: finger FreeRT
cp = make_forcedrt()
cp['stim_type'] = 'practice'
cp['trial_order'] = ['h'] * 10
cp['prep_times'] = [0] * 10
debug['days']['2'].append(cp)  # day2: practice ForcedRT
cp = make_freert()
cp['stim_type'] = 'color'
cp['trial_order'] = ['h', 'u', 'i', 'l']
debug['days']['3'].append(cp)  # day3: color FreeRT
cp = make_forcedrt()
cp['stim_type'] = 'color'
cp['trial_order'] = ['h', 'u', 'i', 'l']
cp['prep_times'] = [0.5] * 4
debug['days']['4'].append(cp)  # day4: color ForcedRT

cp = make_freert()
cp['stim_type'] = 'color'
cp['swap'] = 1
cp['trial_order'] = ['h', 'u', 'i', 'l']
debug['days']['5'].append(cp)  # day5: color FreeRT
cp = make_forcedrt()
cp['stim_type'] = 'color'
cp['swap'] = 1
cp['trial_order'] = ['h', 'u', 'i', 'l']
cp['prep_times'] = [0.5] * 4
debug['days']['6'] = []
debug['days']['6'].append(cp)  # day6: color ForcedRT

debug['days']['7'] = []
d7 = debug['days']['7']
cp = make_freert()
cp['trial_order'] = ['h', 'u', 'i', 'l']
d7.append(cp)  # day1: finger FreeRT
cp = make_forcedrt()
cp['stim_type'] = 'practice'
cp['trial_order'] = ['h'] * 10
cp['prep_times'] = [0] * 10
d7.append(cp)  # day2: practice ForcedRT
cp = make_freert()
cp['stim_type'] = 'color'
cp['trial_order'] = ['h', 'u', 'i', 'l']
d7.append(cp)  # day3: color FreeRT
cp = make_forcedrt()
cp['stim_type'] = 'color'
cp['trial_order'] = ['h', 'u', 'i', 'l']
cp['prep_times'] = [0.5] * 4
d7.append(cp)  # day4: color ForcedRT

cp = make_freert()
cp['stim_type'] = 'color'
cp['swap'] = 1
cp['trial_order'] = ['h', 'u', 'i', 'l']
d7.append(cp)  # day5: color FreeRT
cp = make_forcedrt()
cp['stim_type'] = 'color'
cp['swap'] = 1
cp['trial_order'] = ['h', 'u', 'i', 'l']
cp['prep_times'] = [0.5] * 4
d7.append(cp)


groups = {'1': group1, '2': group2, '3': group3}
for count, g_key in enumerate(groups):
    group = groups[g_key]
    # make RNG
    rng = default_rng(count)
    # **day 1**
    day1 = group['days']['1']
    # 20 free RT per finger (baseline free RT measure?)
    cp = make_freert()
    cp['trial_order'] = make_key_seq(rng, repeat_per_finger=20,
                                     key_subset=keys)
    day1.append(cp)
    # 8 consecutive criterion for single forced RT finger (forced RT familiarization)
    cp = make_forcedrt()
    cp['stim_type'] = 'practice'
    cp['trial_order'] = ['h'] * 80  # if they exceed, just keep going...
    cp['prep_times'] = [0] * 80
    day1.append(cp)
    # spaced 1
    cp = make_freert()
    cp['stim_type'] = 'color'
    cp['trial_order'] = make_key_seq(rng, repeat_per_finger=200,
                                     key_subset=group['spaced'])
    day1.append(cp)
    # **day 2**
    # spaced 2
    day2 = group['days']['2']
    cp = make_freert()
    cp['stim_type'] = 'color'
    cp['trial_order'] = make_key_seq(rng, repeat_per_finger=200,
                                     key_subset=group['spaced'])
    day2.append(cp)
    # **day 3**
    # spaced 3
    day3 = group['days']['3']
    cp = make_freert()
    cp['stim_type'] = 'color'
    cp['trial_order'] = make_key_seq(rng, repeat_per_finger=200,
                                     key_subset=group['spaced'])
    day3.append(cp)
    # **day 4**
    # spaced 4
    day4 = group['days']['4']
    cp = make_freert()
    cp['stim_type'] = 'color'
    cp['trial_order'] = make_key_seq(rng, repeat_per_finger=200,
                                     key_subset=group['spaced'])
    day4.append(cp)
    # **day 5**
    day5 = group['days']['5']
    # spaced 5
    cp = make_freert()
    cp['stim_type'] = 'color'
    cp['trial_order'] = make_key_seq(rng, repeat_per_finger=200,
                                     key_subset=group['spaced'])
    day5.append(cp)
    # massed 1
    cp = make_freert()
    cp['stim_type'] = 'color'
    cp['trial_order'] = make_key_seq(rng, repeat_per_finger=1000,
                                     key_subset=group['massed'])
    day5.append(cp)
    # reminder of timed response (non-criterion)
    cp = make_forcedrt()
    cp['stim_type'] = 'practice'
    cp['trial_order'] = ['h'] * 30
    cp['prep_times'] = [0] * 30
    day5.append(cp)
    # 125 forced RT per finger (how much better now?)
    cp = make_forcedrt()
    cp['stim_type'] = 'color'
    cp['trial_order'], cp['prep_times'] = make_tr_vals(rng, intro=2)
    day5.append(cp)
    # 25 free RT per color (swapped!) (TODO: shorter? most people got it in < 50 trials during criterion)
    cp = make_freert()
    cp['stim_type'] = 'color'
    cp['swap'] = 1
    cp['trial_order'] = make_key_seq(rng, repeat_per_finger=25,
                                     key_subset=keys)
    day5.append(cp)
    # 125 forced RT per finger (swapped) (now's the habit)
    cp = make_forcedrt()
    cp['stim_type'] = 'color'
    cp['swap'] = 1
    cp['trial_order'], cp['prep_times'] = make_tr_vals(rng, intro=2)
    day5.append(cp)

# add debug group for testing
groups['debug'] = debug

with open('sched.json', 'w') as f:
    # these consternations let us specify the number of decimal
    # places for floats (which helps to cut the file size in half)
    json.dump(
        json.loads(json.dumps(groups),
                   parse_float=lambda x: round(float(x), 5)), f,
        separators=(',', ':')
    )
