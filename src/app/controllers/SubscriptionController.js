import { Op } from 'sequelize';

import { isBefore, parseISO, subHours } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.status(200).json(subscriptions);
  }

  async store(req, res) {
    const { id } = req.params;

    const meetup = await Meetup.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (meetup.user_id === req.userId) {
      return res.status(400).json({
        error: "Can't subscribe to your own meetups",
      });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: "You can't subscribe to past meetups" });
    }

    const subscribed = await Subscription.findAll({
      where: {
        meetup_id: id,
        user_id: req.userId,
      },
    });

    if (subscribed && subscribed.length > 0) {
      return res
        .status(400)
        .json({ error: 'You already subscribed to this meetup' });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups with the same time" });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: id,
    });

    const user = await User.findByPk(req.userId);

    await Queue.add(SubscriptionMail.key, { meetup, user });

    return res.status(200).json(subscription);
  }

  async delete(req, res) {
    const { id } = req.params.id;
    const subscription = await Subscription.findByPk(id);

    if (isBefore(parseISO(subscription.date), new Date())) {
      return res.status(400).json({ error: "Can't cancel past subscriptions" });
    }

    const checkHour = subHours(subscription.date, 2);

    if (isBefore(checkHour, new Date())) {
      return res.status(400).json({
        error: "Can't cancel the subscription 2 hours before it starts",
      });
    }

    await subscription.destroy();

    return res.status(200).json();
  }
}

export default new SubscriptionController();
